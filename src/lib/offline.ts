import { useSyncExternalStore } from 'react';
export interface OfflineState {
  supported: boolean;
  registered: boolean;
  ready: boolean;
  busy: boolean;
  done: number;
  total: number;
  bytes: number;
  error: string;
  version: string;
  updateAvailable: boolean;
  packs: Array<{
    id: string;
    version: string;
    done: number;
    total: number;
    bytes: number;
    cachedBytes: number;
    ready: boolean;
    checksum: string;
    dependencies: string[];
  }>;
}
let state: OfflineState = {
  supported:
    import.meta.env.PROD &&
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    window.isSecureContext,
  registered: false,
  ready: false,
  busy: false,
  done: 0,
  total: 0,
  bytes: 0,
  error: '',
  version: '',
  updateAvailable: false,
  packs: [],
};
const listeners = new Set<() => void>();
const update = (next: Partial<OfflineState>) => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
};
let registration: Promise<ServiceWorkerRegistration | null> | null = null;
let observingController = false;
async function waitForActivation(registered: ServiceWorkerRegistration) {
  if (registered.active?.state === 'activated') return registered;
  const worker = registered.installing ?? registered.waiting ?? registered.active;
  if (!worker) throw new Error('Offline worker unavailable');
  await new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timer);
      worker.removeEventListener('statechange', check);
      error ? reject(error) : resolve();
    };
    const check = () => {
      if (worker.state === 'activated') finish();
      else if (worker.state === 'redundant') finish(new Error('Offline installation failed'));
    };
    const timer = setTimeout(() => finish(new Error('Offline installation timed out')), 30000);
    worker.addEventListener('statechange', check);
    check();
  });
  return registered;
}
function exchange(
  worker: ServiceWorker,
  type: 'STATUS' | 'PREPARE' | 'DELETE_PACK' | 'CANCEL' | 'CLEAR_OLD',
  packId?: string,
) {
  return new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel();
    let timer: ReturnType<typeof setTimeout>;
    const fail = () => {
      channel.port1.close();
      reject(new Error('Chưa nhận được trạng thái tải. Hãy thử lại.'));
    };
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(fail, 45000);
    };
    arm();
    channel.port1.onmessage = (event) => {
      arm();
      const message = event.data;
      update({
        done: message.done ?? state.done,
        total: message.total ?? state.total,
        bytes: message.bytes ?? state.bytes,
        version: message.version ?? state.version,
        ready: message.ready ?? state.ready,
        busy:
          typeof message.busy === 'boolean'
            ? message.busy
            : type === 'PREPARE'
              ? message.kind === 'progress'
              : state.busy,
        error: message.error ?? '',
        packs: message.packs ?? state.packs,
      });
      if (message.kind === 'complete' || message.kind === 'error') {
        clearTimeout(timer);
        channel.port1.close();
        message.kind === 'error' ? reject(new Error(message.error)) : resolve();
      }
    };
    worker.postMessage({ type, packId }, [channel.port2]);
  });
}
export function registerOffline() {
  if (!state.supported) return Promise.resolve(null);
  if (!observingController) {
    observingController = true;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      const worker = navigator.serviceWorker.controller;
      if (!worker) return;
      update({ ready: false });
      void exchange(worker, 'STATUS').catch(() =>
        update({ error: 'Chưa đọc được trạng thái phiên bản mới. Hãy tải lại trang.' }),
      );
    });
  }
  if (!registration)
    registration = (async () => {
      try {
        const existing = await navigator.serviceWorker.getRegistration('/');
        const registered =
          !existing || navigator.onLine
            ? await navigator.serviceWorker.register('/sw.js', { scope: '/' })
            : existing;
        const ready = await waitForActivation(registered);
        const checkUpdate = () => update({ updateAvailable: !!registered.waiting });
        checkUpdate();
        const watchInstalling = () => {
          registered.installing?.addEventListener('statechange', checkUpdate);
        };
        watchInstalling();
        registered.addEventListener('updatefound', watchInstalling);
        update({ registered: true });
        if (ready.active) await exchange(ready.active, 'STATUS');
        return ready;
      } catch {
        update({
          error: 'Chưa khởi tạo được chế độ ngoại tuyến. Mở ứng dụng khi có mạng rồi thử lại.',
        });
        registration = null;
        return null;
      }
    })();
  return registration;
}
export async function prepareOffline(packId?: string) {
  if (state.busy) return;
  update({ busy: true, error: '' });
  try {
    const ready = await registerOffline();
    if (!ready?.active)
      throw new Error(
        state.error || 'Chế độ ngoại tuyến cần bản ứng dụng hoàn chỉnh trên HTTPS hoặc localhost.',
      );
    await exchange(ready.active, 'PREPARE', packId);
  } catch (error) {
    update({
      busy: false,
      error: error instanceof Error ? error.message : 'Chưa lưu được bộ ngoại tuyến.',
    });
  }
}
export async function offlineAction(
  type: 'STATUS' | 'DELETE_PACK' | 'CANCEL' | 'CLEAR_OLD',
  packId?: string,
) {
  try {
    const registered = await registerOffline();
    if (!registered?.active) return;
    await exchange(registered.active, type, packId);
  } catch (error) {
    update({
      busy: false,
      error: error instanceof Error ? error.message : 'Chưa hoàn thành thao tác.',
    });
  }
}
export function useOfflineState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state,
  );
}
export async function acceptOfflineUpdate() {
  if (state.busy) return;
  const registered = await registerOffline();
  const waiting = registered?.waiting;
  if (!waiting) return;
  update({ busy: true, error: '' });
  try {
    // Verify the full next version before switching to it.
    await exchange(waiting, 'PREPARE');
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
      once: true,
    });
    waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
  } catch (error) {
    update({
      busy: false,
      error:
        error instanceof Error
          ? error.message
          : 'Chưa cập nhật được. Phiên hiện tại vẫn sử dụng được.',
    });
  }
}
