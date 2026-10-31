import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { DeviceDatabase } from '../src/offline/db';
function mirror(seed: Record<string, string> = {}) {
  const data = new Map(Object.entries(seed));
  return {
    get length() {
      return data.size;
    },
    key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    removeItem: (k: string) => {
      data.delete(k);
    },
  };
}
const get = <T>(r: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
test('migrates legacy data once, snapshots it, skips auth, preserves user records and reopens offline', async () => {
  const factory = new IDBFactory(),
    legacy = mirror({ 'astroai.profiles.v1': '[{"id":"me"}]', 'sb-auth-token': 'secret' });
  const db = new DeviceDatabase(legacy, factory, 'migration');
  await db.initialize();
  assert.equal(db.state.mode, 'indexeddb');
  assert.equal(db.getItem('astroai.profiles.v1'), '[{"id":"me"}]');
  db.write('astroai.tarot-journal.v1', '[{"id":"reading"}]');
  await db.flush();
  db.close();
  const reopened = new DeviceDatabase(legacy, factory, 'migration');
  await reopened.initialize();
  assert.equal(reopened.getItem('astroai.tarot-journal.v1'), '[{"id":"reading"}]');
  reopened.close();
  const raw = await get(factory.open('migration', 1));
  const rows = await get(raw.transaction('records').objectStore('records').getAll());
  assert.ok(rows.every((r) => r.key.startsWith('astroai.')));
  assert.ok(!JSON.stringify(rows).includes('secret'));
  const snapshots = await get(raw.transaction('snapshots').objectStore('snapshots').getAll());
  assert.equal(snapshots.length, 1);
  assert.equal(snapshots[0].id, 'before-legacy-migration');
  raw.close();
});
test('IndexedDB persists when LocalStorage is blocked; batch imports are atomic and snapshot the prior state', async () => {
  const broken = {
    get length(): number {
      throw new Error('blocked');
    },
    key: () => null,
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
    removeItem: () => {
      throw new Error('blocked');
    },
  };
  const factory = new IDBFactory(),
    db = new DeviceDatabase(broken, factory, 'blocked-mirror');
  await db.initialize();
  assert.equal(db.write('astroai.profiles.v1', '["old"]'), true);
  await db.flush();
  await db.batch([
    { key: 'astroai.profiles.v1', value: '["new"]' },
    { key: 'astroai.bookmarks.v1', value: '["major-17-upright"]' },
  ]);
  db.close();
  const reopened = new DeviceDatabase(broken, factory, 'blocked-mirror');
  await reopened.initialize();
  assert.equal(reopened.getItem('astroai.profiles.v1'), '["new"]');
  assert.equal(reopened.getItem('astroai.bookmarks.v1'), '["major-17-upright"]');
  reopened.close();
});
test('synchronous import failure aborts every record, and a deleted record cannot resurrect from the legacy mirror', async () => {
  const factory = new IDBFactory(),
    legacy = mirror(),
    db = new DeviceDatabase(legacy, factory, 'atomic');
  await db.initialize();
  db.write('astroai.profiles.v1', '["keep"]');
  await db.flush();
  const original = IDBObjectStore.prototype.put;
  let writes = 0;
  IDBObjectStore.prototype.put = function (...args: any[]) {
    if (this.name === 'records' && ++writes === 2)
      throw new DOMException('quota', 'QuotaExceededError');
    return original.apply(this, args as [any]);
  };
  try {
    await assert.rejects(
      db.batch([
        { key: 'astroai.profiles.v1', value: '["bad"]' },
        { key: 'astroai.bookmarks.v1', value: '[]' },
      ]),
    );
  } finally {
    IDBObjectStore.prototype.put = original;
  }
  assert.equal(db.getItem('astroai.profiles.v1'), '["keep"]');
  db.write('astroai.profiles.v1', null);
  await db.flush();
  db.close();
  const reopened = new DeviceDatabase(legacy, factory, 'atomic');
  await reopened.initialize();
  assert.equal(reopened.getItem('astroai.profiles.v1'), null);
  reopened.close();
});
test('without IndexedDB, the legacy adapter remains usable and blocked storage reports failure', async () => {
  const legacy = mirror(),
    db = new DeviceDatabase(legacy, undefined);
  await db.initialize();
  assert.equal(db.state.mode, 'localstorage');
  assert.equal(db.write('astroai.visual-theme.v1', '"western"'), true);
  assert.equal(legacy.getItem('astroai.visual-theme.v1'), '"western"');
  const volatile = new DeviceDatabase();
  await volatile.initialize();
  assert.equal(volatile.state.mode, 'memory');
  assert.equal(volatile.write('astroai.profiles.v1', '[]'), false);
  assert.ok(volatile.state.error);
});
