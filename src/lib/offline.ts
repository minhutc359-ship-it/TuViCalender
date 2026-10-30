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
function exchange(worker: ServiceWorker, type: 'STATUS' | 'PREPARE') {
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
        ready: !!message.ready,
        busy: type === 'PREPARE' ? message.kind === 'progress' : state.busy,
        error: message.error ?? '',
      });
      if (message.kind === 'complete' || message.kind === 'error') {
        clearTimeout(timer);
        channel.port1.close();
        message.kind === 'error' ? reject(new Error(message.error)) : resolve();
      }
    };
    worker.postMessage({ type }, [channel.port2]);
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
export async function prepareOffline() {
  if (state.busy) return;
  update({ busy: true, error: '' });
  try {
    const ready = await registerOffline();
    if (!ready?.active)
      throw new Error(
        state.error || 'Chế độ ngoại tuyến cần bản ứng dụng hoàn chỉnh trên HTTPS hoặc localhost.',
      );
    await exchange(ready.active, 'PREPARE');
  } catch (error) {
    update({
      busy: false,
      error: error instanceof Error ? error.message : 'Chưa lưu được bộ ngoại tuyến.',
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
