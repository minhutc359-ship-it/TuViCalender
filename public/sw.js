/* Only public, integrity-checked build resources enter these caches. */
const manifest =
  typeof OFFLINE_MANIFEST === 'undefined'
    ? { version: 'dev', files: [], shell: [], packs: [] }
    : OFFLINE_MANIFEST;
const CACHE_PREFIX = 'astroai-offline-';
const CACHE_NAME = CACHE_PREFIX + manifest.version;
const files = new Map(manifest.files.map((file) => [file.path, file]));
const packs = manifest.packs?.length
  ? manifest.packs
  : [
      { id: 'core', files: manifest.shell, dependencies: [] },
      { id: 'eastern', files: [], dependencies: ['core'] },
      { id: 'western', files: [], dependencies: ['core'] },
      {
        id: 'tarot',
        files: manifest.files.filter((f) => !manifest.shell.includes(f.path)).map((f) => f.path),
        dependencies: ['core'],
      },
    ];
let preparation = null,
  job = null;
const subscribers = new Set();
const hex = async (bytes) =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
async function validResponse(file, response) {
  return (
    !!response?.ok &&
    (await response.clone().arrayBuffer()).byteLength === file.size &&
    (await hex(await response.clone().arrayBuffer())) === file.sha256
  );
}
async function downloadFile(file, cache, signal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(abort, 20000);
  try {
    const response = await fetch(
      new Request(file.path, {
        cache: 'reload',
        credentials: 'same-origin',
        signal: controller.signal,
      }),
    );
    if (!response.ok || response.type === 'opaque')
      throw new Error('Không tải được một tệp của bộ ngoại tuyến.');
    if (!(await validResponse(file, response)))
      throw new Error('Tệp tải về chưa khớp phiên bản ứng dụng. Hãy tải lại khi có mạng ổn định.');
    await cache.put(file.path, response.clone());
    return response;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
async function status() {
  const cache = await caches.open(CACHE_NAME);
  const present = new Set();
  for (const file of manifest.files) {
    const response = await cache.match(file.path);
    if (response?.ok) present.add(file.path);
  }
  const states = packs.map((pack) => ({
    id: pack.id,
    version: manifest.version,
    checksum: pack.checksum ?? '',
    dependencies: pack.dependencies,
    done: pack.files.filter((path) => present.has(path)).length,
    total: pack.files.length,
    bytes: pack.files.reduce((n, path) => n + (files.get(path)?.size ?? 0), 0),
    cachedBytes: pack.files
      .filter((path) => present.has(path))
      .reduce((n, path) => n + (files.get(path)?.size ?? 0), 0),
    ready: pack.files.every((path) => present.has(path)),
  }));
  for (const pack of states)
    pack.ready =
      pack.ready && pack.dependencies.every((id) => states.find((p) => p.id === id)?.ready);
  return {
    busy: !!preparation,
    version: manifest.version,
    done: present.size,
    total: manifest.files.length,
    bytes: manifest.files.reduce((n, f) => n + f.size, 0),
    ready: manifest.files.length > 0 && states.every((pack) => pack.ready),
    packs: states,
  };
}
function broadcast(kind, state) {
  for (const port of subscribers) {
    try {
      port.postMessage({ kind, ...state });
    } catch {}
  }
}
function selectedFiles(packId) {
  if (!packId) return manifest.files;
  const selected = new Set();
  const visit = (id) => {
    const pack = packs.find((p) => p.id === id);
    if (!pack) throw new Error('Gói nội dung không hợp lệ.');
    if (selected.has(id)) return;
    selected.add(id);
    pack.dependencies.forEach(visit);
  };
  visit(packId);
  const paths = new Set(packs.filter((p) => selected.has(p.id)).flatMap((p) => p.files));
  return manifest.files.filter((f) => paths.has(f.path));
}
async function prepare(packId) {
  const cache = await caches.open(CACHE_NAME);
  const targets = selectedFiles(packId);
  const initial = await status();
  let done = initial.done;
  const pending = [];
  for (const file of targets) {
    if (job.cancelled) break;
    const existing = await cache.match(file.path);
    if (existing && !(await validResponse(file, existing))) {
      await cache.delete(file.path);
      done--;
      pending.push(file);
    } else if (!existing) pending.push(file);
  }
  broadcast('progress', { ...initial, done, ready: false, busy: true });
  let cursor = 0,
    failure = null;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (cursor < pending.length && !failure && !job.cancelled) {
        const file = pending[cursor++];
        try {
          await downloadFile(file, cache, job.controller.signal);
          done++;
          broadcast('progress', { ...initial, done, ready: false, busy: true });
        } catch (error) {
          if (!job.cancelled) failure = error;
        }
      }
    }),
  );
  const final = await status();
  if (job.cancelled) return { ...final, cancelled: true };
  if (
    failure ||
    !targets.every((file) =>
      final.packs.some(
        (pack) => pack.ready && packs.find((p) => p.id === pack.id).files.includes(file.path),
      ),
    )
  )
    throw new Error(failure?.message || 'Chưa tải đủ dữ liệu ngoại tuyến.');
  return final;
}
self.addEventListener('install', (event) =>
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const path of manifest.shell) await downloadFile(files.get(path), cache);
    })(),
  ),
);
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('message', (event) => {
  if (event.data?.type === 'ACTIVATE_UPDATE') {
    event.waitUntil(self.skipWaiting());
    return;
  }
  const port = event.ports[0];
  if (!port) return;
  const send = async (fn) => {
    try {
      const value = await fn();
      port.postMessage({ kind: 'complete', busy: false, ...value });
    } catch (error) {
      port.postMessage({
        kind: 'error',
        busy: false,
        error: error.message || 'Không đọc được bộ nhớ ngoại tuyến.',
      });
    }
  };
  if (event.data?.type === 'STATUS') {
    event.waitUntil(send(status));
    return;
  }
  if (event.data?.type === 'CANCEL') {
    if (job) {
      job.cancelled = true;
      job.controller.abort();
    }
    event.waitUntil(send(status));
    return;
  }
  if (event.data?.type === 'DELETE_PACK') {
    event.waitUntil(
      send(async () => {
        if (preparation) throw new Error('Hãy dừng tải trước khi xóa gói.');
        const pack = packs.find((p) => p.id === event.data.packId);
        if (!pack || pack.id === 'core')
          throw new Error('Gói lõi được giữ để ứng dụng tiếp tục hoạt động.');
        const cache = await caches.open(CACHE_NAME);
        for (const path of pack.files) await cache.delete(path);
        return status();
      }),
    );
    return;
  }
  if (event.data?.type === 'CLEAR_OLD') {
    event.waitUntil(
      send(async () => {
        if (preparation) throw new Error('Hãy chờ tải xong trước khi dọn phiên bản cũ.');
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        if (clients.length > 1)
          throw new Error('Hãy đóng các tab AstroAI khác trước khi dọn phiên bản cũ.');
        for (const name of await caches.keys())
          if (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) await caches.delete(name);
        return status();
      }),
    );
    return;
  }
  if (event.data?.type !== 'PREPARE') return;
  const packId = event.data.packId || null;
  if (preparation && job.packId !== packId) {
    event.waitUntil(
      send(async () => {
        throw new Error('Một gói khác đang được tải. Hãy chờ hoặc hủy tải.');
      }),
    );
    return;
  }
  subscribers.add(port);
  if (!preparation) {
    job = { packId, cancelled: false, controller: new AbortController() };
    preparation = prepare(packId)
      .then((value) => broadcast('complete', { ...value, busy: false }))
      .catch(async (error) =>
        broadcast('error', {
          ...(await status()),
          busy: false,
          error:
            error.name === 'AbortError'
              ? 'Kết nối chậm hoặc tải bị gián đoạn. Bạn có thể tiếp tục từ phần đã tải.'
              : error.message,
        }),
      )
      .finally(() => {
        preparation = null;
        job = null;
        for (const subscriber of subscribers) subscriber.close();
        subscribers.clear();
      });
  }
  event.waitUntil(preparation);
});
self.addEventListener('fetch', (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.match('/index.html'))
        .then((shell) => shell || fetch(request))
        .catch(
          () =>
            new Response('Hãy mở ứng dụng và tải dữ liệu khi có mạng.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            }),
        ),
    );
    return;
  }
  const file = files.get(url.pathname);
  if (!file) {
    if (!url.pathname.startsWith('/assets/')) return;
    event.respondWith(
      (async () => {
        for (const name of (await caches.keys()).filter((n) => n.startsWith(CACHE_PREFIX))) {
          const cached = await (await caches.open(name)).match(request);
          if (cached) return cached;
        }
        return fetch(request);
      })(),
    );
    return;
  }
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      return (
        (await cache.match(file.path)) ||
        (request.headers?.get('X-AstroAI-Cache-Only') === '1'
          ? new Response('Gói chưa được tải về máy.', { status: 503 })
          : await downloadFile(file, cache))
      );
    })(),
  );
});
