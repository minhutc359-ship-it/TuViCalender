/** Device records stay readable synchronously after bootstrap; IndexedDB is canonical. */
export interface DeviceRecord {
  key: string;
  value: string | null;
  updatedAt: number;
}
export interface PersistenceState {
  mode: 'starting' | 'indexeddb' | 'localstorage' | 'memory';
  error: string;
  pending: number;
}
type Mirror = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;
const DB_NAME = 'astroai-device';
const CLOCK_KEY = 'astroai.storage-clocks.v1';
const owned = (key: string) => key.startsWith('astroai.') && key !== CLOCK_KEY;
const request = <T>(req: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
const complete = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
  });

export class DeviceDatabase {
  private db: IDBDatabase | null = null;
  private values = new Map<string, DeviceRecord>();
  private clocks: Record<string, number> = {};
  private tail: Promise<void> = Promise.resolve();
  private lastClock = 0;
  private listeners = new Set<() => void>();
  private channel: BroadcastChannel | null = null;
  state: PersistenceState = { mode: 'starting', error: '', pending: 0 };
  constructor(
    private mirror?: Mirror,
    private factory?: IDBFactory,
    private name = DB_NAME,
  ) {}
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  private publish(next: Partial<PersistenceState> = {}) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((fn) => fn());
  }
  private readMirror() {
    const records: DeviceRecord[] = [];
    try {
      const c = JSON.parse(this.mirror?.getItem(CLOCK_KEY) ?? '{}');
      if (c && typeof c === 'object' && !Array.isArray(c)) this.clocks = c;
    } catch {}
    try {
      for (let i = 0; i < (this.mirror?.length ?? 0); i++) {
        const key = this.mirror!.key(i);
        if (key && owned(key))
          records.push({
            key,
            value: this.mirror!.getItem(key),
            updatedAt: Number.isFinite(this.clocks[key]) ? this.clocks[key] : 0,
          });
      }
    } catch {}
    return records;
  }
  async initialize() {
    const legacy = this.readMirror();
    for (const row of legacy) this.values.set(row.key, row);
    if (!this.factory) {
      this.publish({ mode: this.mirror ? 'localstorage' : 'memory' });
      return;
    }
    try {
      this.db = await new Promise<IDBDatabase>((resolve, reject) => {
        let ended = false;
        const timer = setTimeout(() => {
          ended = true;
          reject(new Error('Database blocked'));
        }, 4000);
        const opening = this.factory!.open(this.name, 1);
        opening.onupgradeneeded = () => {
          for (const name of ['records', 'meta', 'snapshots', 'outbox'])
            if (!opening.result.objectStoreNames.contains(name))
              opening.result.createObjectStore(name, {
                keyPath: name === 'records' || name === 'outbox' ? 'key' : 'id',
              });
        };
        opening.onsuccess = () => {
          clearTimeout(timer);
          if (ended) {
            opening.result.close();
            return;
          }
          resolve(opening.result);
        };
        opening.onerror = () => {
          clearTimeout(timer);
          reject(opening.error);
        };
        opening.onblocked = () => {
          clearTimeout(timer);
          ended = true;
          reject(new Error('Database blocked'));
        };
      });
      this.db.onversionchange = () => {
        this.db?.close();
        this.db = null;
        this.publish({
          mode: 'localstorage',
          error: 'Có phiên bản dữ liệu mới. Hãy lưu công việc rồi tải lại trang.',
        });
      };
      const read = this.db.transaction(['records', 'meta'], 'readonly');
      const [rows, migrated] = await Promise.all([
        request(read.objectStore('records').getAll()) as Promise<DeviceRecord[]>,
        request(read.objectStore('meta').get('legacy-migration')),
      ]);
      this.values = new Map(rows.map((row) => [row.key, row]));
      const changes = legacy.filter(
        (row) => !this.values.has(row.key) || row.updatedAt > this.values.get(row.key)!.updatedAt,
      );
      if (changes.length || !migrated) {
        const tx = this.db.transaction(['records', 'meta', 'snapshots'], 'readwrite');
        const done = complete(tx);
        if (!migrated)
          tx.objectStore('snapshots').put({
            id: 'before-legacy-migration',
            createdAt: new Date().toISOString(),
            records: legacy,
            schemaVersion: 1,
          });
        for (const row of changes) {
          tx.objectStore('records').put(row);
          this.values.set(row.key, row);
        }
        tx.objectStore('meta').put({
          id: 'legacy-migration',
          completedAt: new Date().toISOString(),
          schemaVersion: 1,
        });
        await done;
      }
      this.lastClock = Math.max(0, ...[...this.values.values()].map((row) => row.updatedAt));
      this.publish({ mode: 'indexeddb', error: '' });
      if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel('astroai-records-v1');
        this.channel.onmessage = async (event) => {
          if (!this.db || typeof event.data?.key !== 'string') return;
          const row = (await request(
            this.db.transaction('records').objectStore('records').get(event.data.key),
          )) as DeviceRecord | undefined;
          if (row) {
            this.values.set(row.key, row);
            this.publish();
          }
        };
      }
    } catch {
      for (const row of legacy) this.values.set(row.key, row);
      this.publish({
        mode: this.mirror ? 'localstorage' : 'memory',
        error:
          'IndexedDB chưa khả dụng. Đang dùng bộ nhớ dự phòng của trình duyệt; hãy xuất bản sao dữ liệu.',
      });
    }
  }
  getItem = (key: string): string | null => {
    if (this.values.has(key)) return this.values.get(key)!.value;
    try {
      return this.mirror?.getItem(key) ?? null;
    } catch {
      return null;
    }
  };
  private mirrorWrite(row: DeviceRecord) {
    try {
      if (!this.mirror) return false;
      row.value === null
        ? this.mirror.removeItem(row.key)
        : this.mirror.setItem(row.key, row.value);
      this.clocks[row.key] = row.updatedAt;
      this.mirror.setItem(CLOCK_KEY, JSON.stringify(this.clocks));
      return true;
    } catch {
      return false;
    }
  }
  write(key: string, value: string | null): boolean {
    if (!owned(key)) return false;
    const row = {
      key,
      value,
      updatedAt: (this.lastClock = Math.max(Date.now(), this.lastClock + 1)),
    };
    this.values.set(key, row);
    const mirrored = this.mirrorWrite(row);
    if (!this.db) {
      this.publish({
        error: mirrored
          ? ''
          : 'Không lưu được dữ liệu bền vững. Hãy xuất bản sao trước khi đóng ứng dụng.',
      });
      return mirrored;
    }
    this.publish({ pending: this.state.pending + 1 });
    this.tail = this.tail.then(async () => {
      try {
        const tx = this.db!.transaction(['records', 'outbox'], 'readwrite');
        const done = complete(tx);
        tx.objectStore('records').put(row);
        tx.objectStore('outbox').put({
          key: row.key,
          updatedAt: row.updatedAt,
          status: 'local-only',
        });
        await done;
        this.channel?.postMessage({ key: row.key });
      } catch {
        this.publish({
          error: mirrored
            ? 'IndexedDB chưa ghi được; dữ liệu đã có bản dự phòng tại máy.'
            : 'Không ghi được dữ liệu. Hãy xuất bản sao trước khi đóng ứng dụng.',
        });
      } finally {
        this.publish({ pending: Math.max(0, this.state.pending - 1) });
      }
    });
    return true;
  }
  async batch(entries: Array<{ key: string; value: string | null }>) {
    await this.flush();
    if (entries.some((e) => !owned(e.key))) throw new Error('Khóa dữ liệu chưa hợp lệ.');
    const before = [...this.values.values()];
    const rows = entries.map((e) => ({
      ...e,
      updatedAt: (this.lastClock = Math.max(Date.now(), this.lastClock + 1)),
    }));
    if (this.db) {
      const tx = this.db.transaction(['records', 'snapshots', 'outbox'], 'readwrite');
      const done = complete(tx);
      try {
        tx.objectStore('snapshots').put({
          id: `before-import-${Date.now()}`,
          createdAt: new Date().toISOString(),
          records: before,
          schemaVersion: 1,
        });
        for (const row of rows) {
          tx.objectStore('records').put(row);
          tx.objectStore('outbox').put({
            key: row.key,
            updatedAt: row.updatedAt,
            status: 'local-only',
          });
        }
      } catch (error) {
        tx.abort();
        await done.catch(() => {});
        throw error;
      }
      await done; // Native transaction: none of the incoming records survives a failed write.
      for (const row of rows) {
        this.values.set(row.key, row);
        this.mirrorWrite(row);
        this.channel?.postMessage({ key: row.key });
      }
      this.publish();
      return;
    }
    const previous = entries.map((e) => ({ key: e.key, value: this.getItem(e.key) }));
    try {
      for (const row of rows) if (!this.mirrorWrite(row)) throw new Error('Storage unavailable');
    } catch {
      for (const row of previous) this.mirrorWrite({ ...row, updatedAt: ++this.lastClock });
      throw new Error(
        'Chưa nhập được dữ liệu. Đã cố gắng khôi phục bản trước; hãy giữ tệp sao lưu.',
      );
    }
    for (const row of rows) this.values.set(row.key, row);
    this.publish();
  }
  async flush() {
    await this.tail;
  }
  close() {
    this.channel?.close();
    this.db?.close();
    this.db = null;
  }
}
let mirror: Storage | undefined;
try {
  if (typeof localStorage !== 'undefined') mirror = localStorage;
} catch {}
export const deviceDatabase = new DeviceDatabase(
  mirror,
  typeof indexedDB !== 'undefined' ? indexedDB : undefined,
);
export const deviceStorage = {
  getItem: deviceDatabase.getItem,
  setItem: (key: string, value: string) => {
    if (!deviceDatabase.write(key, value)) throw new Error('Storage unavailable');
  },
  removeItem: (key: string) => {
    if (!deviceDatabase.write(key, null)) throw new Error('Storage unavailable');
  },
};
