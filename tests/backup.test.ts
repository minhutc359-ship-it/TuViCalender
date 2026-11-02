import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBackup,
  parseBackup,
  previewBackup,
  importBackup,
  type Backup,
} from '../src/offline/backup';
function store(seed: Record<string, unknown> = {}) {
  const map = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
}
const profile = {
  id: 'me',
  name: 'Minh',
  birthDate: '2000-01-01',
  birthTime: '12:00',
  birthPlace: 'Hà Nội',
};
test('backup allowlist omits auth and account chat, forces AI opt-in off and round trips known data', () => {
  const s = store({
    'astroai.profiles.v1': [profile],
    'astroai.oracle.v1': [{
      id: 'cast-1', createdAt: '2026-11-02T00:00:00.000Z', question: 'Điều gì cần nhìn rõ?', lines: [7, 8, 7, 8, 9, 6],
    }],
    'sb-token': { secret: 'excluded' },
    'astroai.chat.user.v1': [{ role: 'user', content: 'private' }],
    'astroai.chat-ai-enabled.v1': true,
  });
  const backup = createBackup(s);
  assert.deepEqual(backup.data['astroai.profiles.v1'], [profile]);
  assert.equal((backup.data['astroai.oracle.v1'] as unknown[]).length, 1);
  assert.equal(backup.data['astroai.chat-ai-enabled.v1'], false);
  assert.ok(!JSON.stringify(backup).includes('excluded'));
  assert.ok(!JSON.stringify(backup).includes('private'));
  assert.deepEqual(parseBackup(JSON.stringify(backup)), backup);
});
test('import adds new IDs, preserves conflicting records/settings, previews counts and is idempotent', () => {
  const backup = createBackup(
    store({
      'astroai.profiles.v1': [profile, { ...profile, id: 'new' }],
      'astroai.visual-theme.v1': 'eastern',
    }),
  );
  const s = store({
    'astroai.profiles.v1': [{ ...profile, name: 'Keep me' }],
    'astroai.visual-theme.v1': 'western',
  });
  assert.deepEqual(previewBackup(backup, s)[0], { title: 'Hồ sơ', added: 1, kept: 1 });
  importBackup(backup, s);
  importBackup(backup, s);
  assert.deepEqual(JSON.parse(s.getItem('astroai.profiles.v1')!), [
    { ...profile, name: 'Keep me' },
    { ...profile, id: 'new' },
  ]);
  assert.equal(s.getItem('astroai.visual-theme.v1'), '"western"');
});
test('reject malformed, wrong version, unknown keys, duplicate IDs, invalid records and oversized JSON before writes', () => {
  const base = createBackup(store());
  for (const value of [
    null,
    [],
    { ...base, schemaVersion: 2 },
    { ...base, data: { 'sb-token': 'secret' } },
    { ...base, data: { __proto__: null, 'astroai.profiles.v1': [null] } },
    { ...base, data: { 'astroai.profiles.v1': [profile, profile] } },
    { ...base, data: { 'astroai.tarot-journal.v1': [{}] } },
  ])
    assert.throws(() => parseBackup(JSON.stringify(value)));
  assert.throws(() => parseBackup('{bad'));
  assert.throws(() => parseBackup('x'.repeat(8 * 1048576 + 1)));
  const s = store({ 'astroai.visual-theme.v1': 'western' });
  s.map.set('astroai.profiles.v1', 'bad json');
  assert.throws(() =>
    importBackup(
      { ...base, data: { 'astroai.profiles.v1': [profile], 'astroai.visual-theme.v1': 'eastern' } },
      s,
    ),
  );
  assert.equal(s.getItem('astroai.visual-theme.v1'), '"western"');
});
test('write failure rolls back completed writes and keeps unrelated data', () => {
  const s = store({ 'astroai.visual-theme.v1': 'western', unrelated: 'keep' });
  const before = new Map(s.map);
  let count = 0;
  const original = s.setItem;
  s.setItem = (key, value) => {
    if (++count === 2) throw new Error('quota');
    original(key, value);
  };
  const b: Backup = {
    app: 'AstroAI',
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    data: { 'astroai.profiles.v1': [profile], 'astroai.visual-theme.v1': 'eastern' },
  };
  assert.throws(() => importBackup(b, s), /Đã khôi phục/);
  assert.deepEqual(s.map, before);
});
