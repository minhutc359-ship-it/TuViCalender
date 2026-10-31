import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash, webcrypto } from 'node:crypto';
const origin = 'https://astroai.example';
function worker() {
  const bodies = new Map([
    ['/index.html', 'app-v2'],
    ['/assets/app-v2.js', 'code-v2'],
    ['/assets/card.svg', '<svg/>'],
    ['/content/eastern/data.json', 'eastern'],
    ['/content/western/data.json', 'western'],
  ]);
  const manifest = {
    version: 'v2',
    files: [...bodies].map(([path, body]) => ({
      path,
      size: Buffer.byteLength(body),
      sha256: createHash('sha256').update(body).digest('hex'),
    })),
    shell: ['/index.html', '/assets/app-v2.js'],
    packs: [
      { id: 'core', files: ['/index.html', '/assets/app-v2.js'], dependencies: [] },
      { id: 'eastern', files: ['/content/eastern/data.json'], dependencies: ['core'] },
      { id: 'western', files: ['/content/western/data.json'], dependencies: ['core'] },
      { id: 'tarot', files: ['/assets/card.svg'], dependencies: ['core'] },
    ],
  };
  const cachesData = new Map<string, Map<string, Response>>();
  const key = (r: any) => new URL(typeof r === 'string' ? r : r.url, origin).href;
  const open = async (name: string) => {
    if (!cachesData.has(name)) cachesData.set(name, new Map());
    const data = cachesData.get(name)!;
    return {
      keys: async () => [...data.keys()].map((url) => new Request(url)),
      match: async (r: any) => data.get(key(r))?.clone(),
      put: async (r: any, response: Response) => {
        data.set(key(r), response.clone());
      },
      delete: async (r: any) => data.delete(key(r)),
    };
  };
  const events: Record<string, (e: any) => void> = {};
  let skipped = 0,
    online = true;
  let slowPath: string | null = null,
    clientCount = 1;
  const requests: string[] = [];
  const self = {
    location: { origin },
    clients: {
      claim: async () => {},
      matchAll: async () => Array.from({ length: clientCount }, (_, i) => ({ id: String(i) })),
    },
    skipWaiting: async () => {
      skipped++;
    },
    addEventListener: (name: string, fn: any) => {
      events[name] = fn;
    },
  };
  class RelativeRequest extends Request {
    constructor(url: any, init: any) {
      super(new URL(typeof url === 'string' ? url : url.url, origin), init);
    }
  }
  const context = vm.createContext({
    self,
    OFFLINE_MANIFEST: manifest,
    URL,
    Request: RelativeRequest,
    Response,
    crypto: webcrypto,
    AbortController,
    setTimeout,
    clearTimeout,
    caches: {
      open,
      keys: async () => [...cachesData.keys()],
      delete: async (name: string) => cachesData.delete(name),
    },
    fetch: async (r: any) => {
      const path = new URL(typeof r === 'string' ? r : r.url, origin).pathname;
      requests.push(path);
      if (!online) throw new Error('offline');
      if (path === slowPath)
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 200);
          r.signal?.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              reject(new Error('aborted'));
            },
            { once: true },
          );
        });
      return new Response(bodies.get(path) ?? 'missing', { status: bodies.has(path) ? 200 : 404 });
    },
  });
  vm.runInContext(readFileSync('public/sw.js', 'utf8'), context);
  const dispatch = async (name: string, extra: any = {}) => {
    let result: any;
    events[name]({
      ...extra,
      waitUntil: (p: any) => {
        result = p;
      },
      respondWith: (p: any) => {
        result = p;
      },
    });
    return await result;
  };
  const message = async (type: string, extra: Record<string, unknown> = {}) => {
    const messages: any[] = [];
    await dispatch('message', {
      data: { type, ...extra },
      ports: [{ postMessage: (m: any) => messages.push(m), close: () => {} }],
    });
    return messages.at(-1);
  };
  return {
    dispatch,
    message,
    setSlow: (path: string | null) => {
      slowPath = path;
    },
    setClients: (n: number) => {
      clientCount = n;
    },
    open,
    bodies,
    requests,
    setOffline: () => {
      online = false;
    },
    get skipped() {
      return skipped;
    },
  };
}
test('install precaches shell without forcing activation; explicit acceptance activates the update', async () => {
  const w = worker();
  await w.dispatch('install');
  assert.equal(w.skipped, 0);
  const status = await w.message('STATUS');
  assert.equal(status.ready, false);
  assert.equal(status.done, 2);
  await w.dispatch('message', { data: { type: 'ACTIVATE_UPDATE' }, ports: [] });
  assert.equal(w.skipped, 1);
});
test('complete downloads verify bytes, interrupted/corrupt content is retryable, and eviction removes readiness', async () => {
  const w = worker();
  await w.dispatch('install');
  w.bodies.set('/assets/card.svg', 'corrupt');
  assert.equal((await w.message('PREPARE')).kind, 'error');
  assert.equal((await w.message('STATUS')).ready, false);
  w.bodies.set('/assets/card.svg', '<svg/>');
  assert.equal((await w.message('PREPARE')).ready, true);
  const count = w.requests.length;
  assert.equal((await w.message('PREPARE')).ready, true);
  assert.equal(w.requests.length, count);
  await (await w.open('astroai-offline-v2')).delete('/assets/card.svg');
  assert.equal((await w.message('STATUS')).ready, false);
});
test('navigation remains on the matching shell and an old tab can load its cached hashed chunk offline', async () => {
  const w = worker();
  await w.dispatch('install');
  await w.message('PREPARE');
  const previous = await w.open('astroai-offline-v1');
  await previous.put('/assets/app-v1.js', new Response('old-code'));
  w.setOffline();
  const shell = await w.dispatch('fetch', {
    request: { url: origin + '/tarot', method: 'GET', mode: 'navigate' },
  });
  assert.equal(await shell.text(), 'app-v2');
  const chunk = await w.dispatch('fetch', { request: new Request(origin + '/assets/app-v1.js') });
  assert.equal(await chunk.text(), 'old-code');
  assert.equal(
    await w.dispatch('fetch', { request: new Request(origin + '/api/private') }),
    undefined,
  );
  assert.equal(
    await w.dispatch('fetch', { request: new Request('https://other.example/assets/secret') }),
    undefined,
  );
  assert.equal(
    await w.dispatch('fetch', {
      request: new Request(origin + '/assets/card.svg', { method: 'POST' }),
    }),
    undefined,
  );
});
test('four packs have independent readiness and removal never deletes another pack or core', async () => {
  const w = worker();
  await w.dispatch('install');
  let result = await w.message('PREPARE', { packId: 'eastern' });
  assert.equal(result.packs.find((p: any) => p.id === 'eastern').ready, true);
  assert.equal(result.packs.find((p: any) => p.id === 'western').ready, false);
  assert.equal(result.ready, false);
  result = await w.message('DELETE_PACK', { packId: 'eastern' });
  assert.equal(result.packs.find((p: any) => p.id === 'eastern').ready, false);
  assert.equal(result.packs.find((p: any) => p.id === 'core').ready, true);
  assert.equal((await w.message('DELETE_PACK', { packId: 'core' })).kind, 'error');
  assert.equal((await w.message('PREPARE', { packId: 'unknown' })).kind, 'error');
});
test('cancel keeps verified files for resume and old-cache cleanup refuses to strand other open tabs', async () => {
  const w = worker();
  await w.dispatch('install');
  w.setSlow('/assets/card.svg');
  const pending = w.message('PREPARE', { packId: 'tarot' });
  while (!w.requests.includes('/assets/card.svg'))
    await new Promise((resolve) => setTimeout(resolve, 1));
  await w.message('CANCEL');
  assert.equal((await pending).cancelled, true);
  let result = await w.message('STATUS');
  assert.equal(result.packs.find((p: any) => p.id === 'core').ready, true);
  assert.equal(result.packs.find((p: any) => p.id === 'tarot').ready, false);
  w.setSlow(null);
  assert.equal(
    (await w.message('PREPARE', { packId: 'tarot' })).packs.find((p: any) => p.id === 'tarot')
      .ready,
    true,
  );
  const old = await w.open('astroai-offline-old');
  await old.put('/assets/old.js', new Response('old'));
  w.setClients(2);
  assert.equal((await w.message('CLEAR_OLD')).kind, 'error');
  assert.ok(await old.match('/assets/old.js'));
  w.setClients(1);
  result = await w.message('CLEAR_OLD');
  assert.equal(result.kind, 'complete');
});

test('cache-only knowledge reads never repopulate a removed pack even if the browser worker can still reach the network',async()=>{
 const w=worker();await w.dispatch('install');const count=w.requests.length;
 const missing=await w.dispatch('fetch',{request:new Request(origin+'/content/eastern/data.json',{headers:{'X-AstroAI-Cache-Only':'1'}})});
 assert.equal(missing.status,503);assert.equal(w.requests.length,count);
 const hit=await w.dispatch('fetch',{request:new Request(origin+'/assets/app-v2.js',{headers:{'X-AstroAI-Cache-Only':'1'}})});
 assert.equal(await hit.text(),'code-v2');assert.equal(w.requests.length,count);
});
