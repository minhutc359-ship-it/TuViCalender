/* Build metadata is injected by scripts/build-offline.mjs. Public assets only. */
const manifest =
  typeof OFFLINE_MANIFEST === 'undefined'
    ? { version: 'dev', files: [], shell: [] }
    : OFFLINE_MANIFEST;
const CACHE_PREFIX = 'astroai-offline-';
const CACHE_NAME = CACHE_PREFIX + manifest.version;
const files = new Map(manifest.files.map((file) => [file.path, file]));
const subscribers = new Set();
let preparation = null;

async function downloadFile(file, cache) {
  const response = await fetch(
    new Request(file.path, { cache: 'reload', credentials: 'same-origin' }),
  );
  if (!response.ok || response.type === 'opaque')
    throw new Error('Không tải được một tệp của bộ ngoại tuyến.');
  const bytes = await response.clone().arrayBuffer();
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  if (bytes.byteLength !== file.size || digest !== file.sha256)
    throw new Error('Tệp tải về chưa khớp phiên bản ứng dụng. Hãy tải lại khi có mạng ổn định.');
  await cache.put(file.path, response.clone());
  return response;
}
async function status() {
  const cache = await caches.open(CACHE_NAME);
  const keys = new Set((await cache.keys()).map((request) => new URL(request.url).pathname));
  const done = manifest.files.filter((file) => keys.has(file.path)).length;
  return {
    version: manifest.version,
    done,
    total: manifest.files.length,
    bytes: manifest.files.reduce((sum, file) => sum + file.size, 0),
    ready: manifest.files.length > 0 && done === manifest.files.length,
  };
}
function broadcast(kind, state) {
  for (const port of subscribers) {
    try {
      port.postMessage({ kind, ...state });
    } catch {}
  }
}
async function prepare() {
  const cache = await caches.open(CACHE_NAME);
  const initial = await status();
  let done = initial.done;
  const pending = [];
  for (const file of manifest.files) if (!(await cache.match(file.path))) pending.push(file);
  broadcast('progress', { ...initial, busy: true });
  let cursor = 0,
    failure = null;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (cursor < pending.length && !failure) {
        const file = pending[cursor++];
        try {
          await downloadFile(file, cache);
          done++;
          broadcast('progress', { ...initial, done, ready: false, busy: true });
        } catch (error) {
          failure = error;
        }
      }
    }),
  );
  const final = await status();
  if (failure || !final.ready)
    throw new Error(failure?.message || 'Chưa tải đủ dữ liệu ngoại tuyến.');
  // Old versions remain available until the new complete bundle is verified.
  await Promise.all(
    (await caches.keys())
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)),
  );
  return final;
}
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const path of manifest.shell) await downloadFile(files.get(path), cache);
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('message', (event) => {
  const port = event.ports[0];
  if (!port) return;
  if (event.data?.type === 'STATUS') {
    event.waitUntil(
      status()
        .then((value) => port.postMessage({ kind: 'complete', ...value }))
        .catch(() =>
          port.postMessage({ kind: 'error', error: 'Không đọc được bộ nhớ ngoại tuyến.' }),
        ),
    );
    return;
  }
  if (event.data?.type !== 'PREPARE') return;
  subscribers.add(port);
  if (!preparation)
    preparation = prepare()
      .then((value) => broadcast('complete', { ...value, busy: false }))
      .catch(async (error) =>
        broadcast('error', {
          ...(await status()),
          busy: false,
          error: error.message || 'Chưa lưu được dữ liệu ngoại tuyến.',
        }),
      )
      .finally(() => {
        preparation = null;
        for (const subscriber of subscribers) subscriber.close();
        subscribers.clear();
      });
  event.waitUntil(preparation);
});
self.addEventListener('fetch', (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () =>
        (await caches.open(CACHE_NAME))
          .match('/index.html')
          .then(
            (response) =>
              response ||
              new Response('Hãy mở ứng dụng và tải dữ liệu khi có mạng.', {
                status: 503,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
              }),
          ),
      ),
    );
    return;
  }
  const file = files.get(url.pathname);
  if (!file) return; // Never cache API/auth requests or arbitrary user data.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(file.path)) || (await downloadFile(file, cache));
    })(),
  );
});
