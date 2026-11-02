import { isProfiles } from '../lib/profiles';
import { isReadings } from '../features/tarot/engine/reading';
import { validMessages } from '../features/chatbot/messages';
import { isOracleCast } from '../features/oracle/engine';
import { deviceDatabase, deviceStorage } from './db';

export interface Backup {
  app: 'AstroAI';
  schemaVersion: 1;
  createdAt: string;
  data: Record<string, unknown>;
}
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const list = (v: unknown): v is Array<Record<string, unknown>> =>
  Array.isArray(v) && v.length <= 2000 && v.every((e) => e && typeof e === 'object');
const bool = (v: unknown) => typeof v === 'boolean';
const keys: Record<
  string,
  { title: string; valid: (v: unknown) => boolean; merge?: 'id' | 'value' }
> = {
  'astroai.profiles.v1': {
    title: 'Hồ sơ',
    valid: (v) => isProfiles(v) && v.length <= 200,
    merge: 'id',
  },
  'astroai.active-profile.v1': {
    title: 'Hồ sơ đang chọn',
    valid: (v) => typeof v === 'string' && v.length <= 200,
  },
  'astroai.tarot-journal.v1': {
    title: 'Nhật ký Tarot',
    valid: (v) => isReadings(v) && v.length <= 200,
    merge: 'id',
  },
  'astroai.oracle.v1': {
    title: 'Nhật ký gieo quẻ',
    valid: (v) => Array.isArray(v) && v.length <= 30 && v.every(isOracleCast),
    merge: 'id',
  },
  'astroai.calendar-events.v1': {
    title: 'Sự kiện lịch',
    valid: (v) =>
      list(v) &&
      v.every(
        (e) =>
          typeof e.id === 'string' &&
          typeof e.title === 'string' &&
          e.title.length <= 500 &&
          typeof e.date === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test(e.date),
      ),
    merge: 'id',
  },
  'astroai.bookmarks.v1': {
    title: 'Nội dung đã lưu',
    valid: (v) =>
      Array.isArray(v) &&
      v.length <= 1000 &&
      v.every((id) => typeof id === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(id)),
    merge: 'value',
  },
  'astroai.chat.local.v1': { title: 'Chat local', valid: validMessages },
  'astroai.chat-persona.v1': {
    title: 'Góc nhìn trợ lý',
    valid: (v) => ['eastern', 'western'].includes(v as string),
  },
  'astroai.chat-save.v1': { title: 'Tùy chọn lưu chat', valid: bool },
  'astroai.chat-ai-enabled.v1': { title: 'Tùy chọn AI', valid: bool },
  'astroai.visual-theme.v1': {
    title: 'Chủ đề giao diện',
    valid: (v) => ['fusion', 'eastern', 'western', 'auto'].includes(v as string),
  },
  'astroai.visual-motion.v1': {
    title: 'Chuyển động',
    valid: (v) => ['gentle', 'calm'].includes(v as string),
  },
  'astroai.tarot-appearance.v1': {
    title: 'Bộ minh họa',
    valid: (v) => ['celestial-v1', 'jojo-ref'].includes(v as string),
  },
};
function validateData(data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) {
    if (!Object.hasOwn(keys, key) || !keys[key].valid(value))
      throw new Error(`Dữ liệu không hợp lệ: ${key}`);
    if (keys[key].merge) {
      const values = (value as unknown[]).map((v) =>
        keys[key].merge === 'id' ? (v as { id: string }).id : v,
      );
      if (new Set(values).size !== values.length) throw new Error(`Có ID trùng: ${key}`);
    }
  }
}
export function parseBackup(text: string): Backup {
  if (new TextEncoder().encode(text).length > 8 * 1048576)
    throw new Error('Tệp sao lưu vượt quá 8 MiB.');
  let b: any;
  try {
    b = JSON.parse(text);
  } catch {
    throw new Error('Tệp không phải JSON hợp lệ.');
  }
  if (
    !b ||
    b.app !== 'AstroAI' ||
    b.schemaVersion !== 1 ||
    typeof b.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(b.createdAt)) ||
    !b.data ||
    typeof b.data !== 'object' ||
    Array.isArray(b.data)
  )
    throw new Error('Định dạng hoặc phiên bản sao lưu chưa được hỗ trợ.');
  validateData(b.data);
  if (Object.hasOwn(b.data, 'astroai.chat-ai-enabled.v1'))
    b.data['astroai.chat-ai-enabled.v1'] = false;
  return b;
}
export function createBackup(storage: Store): Backup {
  const data: Record<string, unknown> = {};
  for (const key of Object.keys(keys)) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      throw new Error(`Dữ liệu tại máy bị hỏng: ${keys[key].title}`);
    }
    // Enabling AI requires a new choice on the importing device.
    if (key === 'astroai.chat-ai-enabled.v1') data[key] = false;
  }
  validateData(data);
  const result: Backup = {
    app: 'AstroAI',
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    data,
  };
  return parseBackup(JSON.stringify(result));
}
function mergeValue(key: string, existing: unknown, incoming: unknown) {
  const spec = keys[key];
  if (!spec.merge || !Array.isArray(existing)) return existing;
  const identity = (v: any) => (spec.merge === 'id' ? v.id : v);
  const seen = new Set(existing.map(identity));
  const additions = (incoming as unknown[]).filter((v) => !seen.has(identity(v)));
  const merged = [...existing, ...additions];
  if (!spec.valid(merged))
    throw new Error(`Gộp ${spec.title} sẽ vượt giới hạn. Hãy dọn dữ liệu hoặc dùng tệp nhỏ hơn.`);
  return merged;
}
function changes(backup: Backup, storage: Store) {
  validateData(backup.data);
  return Object.entries(backup.data).map(([key, incoming]) => {
    const raw = storage.getItem(key);
    if (key === 'astroai.chat-ai-enabled.v1') incoming = false;
    if (raw === null)
      return {
        key,
        value: incoming,
        added: Array.isArray(incoming) ? incoming.length : 1,
        kept: 0,
      };
    let existing: unknown;
    try {
      existing = JSON.parse(raw);
    } catch {
      throw new Error(`Dữ liệu ${keys[key].title} tại máy bị hỏng; chưa thay đổi dữ liệu.`);
    }
    if (!keys[key].valid(existing))
      throw new Error(`Dữ liệu ${keys[key].title} tại máy chưa hợp lệ; chưa thay đổi dữ liệu.`);
    const value = mergeValue(key, existing, incoming);
    return {
      key,
      value,
      added:
        Array.isArray(value) && keys[key].merge ? value.length - (existing as unknown[]).length : 0,
      kept: Array.isArray(incoming)
        ? incoming.length -
          (Array.isArray(value) && keys[key].merge
            ? value.length - (existing as unknown[]).length
            : 0)
        : 1,
    };
  });
}
export function previewBackup(backup: Backup, storage: Store) {
  return changes(backup, storage).map(({ key, added, kept }) => ({
    title: keys[key].title,
    added,
    kept,
  }));
}
export function importBackup(backup: Backup, storage: Store) {
  // Validate and calculate every change before writing. Existing IDs/settings win.
  const pending = changes(backup, storage);
  const previous = pending.map((p) => ({ key: p.key, raw: storage.getItem(p.key) }));
  try {
    for (const p of pending) storage.setItem(p.key, JSON.stringify(p.value));
  } catch {
    let recovered = true;
    for (const p of previous) {
      try {
        p.raw === null ? storage.removeItem(p.key) : storage.setItem(p.key, p.raw);
      } catch {
        recovered = false;
      }
    }
    throw new Error(
      recovered
        ? 'Không đủ bộ nhớ hoặc trình duyệt chặn ghi. Đã khôi phục dữ liệu trước khi nhập.'
        : 'Ghi dữ liệu bị chặn; chưa thể khôi phục toàn bộ. Giữ tệp sao lưu và kiểm tra dữ liệu trước khi tiếp tục.',
    );
  }
}
export async function importBackupToDevice(backup: Backup) {
  const pending = changes(backup, deviceStorage);
  await deviceDatabase.batch(pending.map((p) => ({ key: p.key, value: JSON.stringify(p.value) })));
}
