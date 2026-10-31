import { mkdir, writeFile } from 'node:fs/promises';
import { KNOWLEDGE, KNOWLEDGE_VERSION } from './content/catalog-source';
const coreIds = new Set([
  'ngu-hanh',
  'bat-quai',
  'can-chi',
  'bat-tu',
  'tiet-khi',
  'lich-am',
  'gio-tot',
  'ngay-tot',
  'sun-moon-rising',
  'natal',
  'tarot-guide',
  'reversed',
  'offline',
  'privacy',
]);
for (const pack of ['core', 'eastern', 'western', 'tarot']) {
  const entries = KNOWLEDGE.filter((entry) =>
    pack === 'core' ? coreIds.has(entry.id) : entry.category === pack && !coreIds.has(entry.id),
  ).map((entry) => ({
    ...entry,
    intentId: entry.id,
    examples: [
      `${entry.title} là gì?`,
      `Giải thích ${entry.title}`,
      `Tôi muốn tìm hiểu ${entry.title}`,
      `Tra cứu ${entry.title}`,
    ],
    kind: 'traditionalInterpretation',
  }));
  await mkdir(`public/content/${pack}`, { recursive: true });
  await writeFile(
    `public/content/${pack}/knowledge.vi.json`,
    JSON.stringify(
      {
        id: pack,
        locale: 'vi',
        version: KNOWLEDGE_VERSION,
        schemaVersion: 1,
        updatedAt: '2026-10-31',
        source: 'AstroAI · Nội dung biên soạn và bảng quy tắc nội bộ',
        entries,
      },
      null,
      2,
    ) + '\n',
  );
}
await writeFile(
  'public/content/intent-registry.vi.json',
  JSON.stringify(
    {
      schemaVersion: 1,
      locale: 'vi',
      version: KNOWLEDGE_VERSION,
      groups: KNOWLEDGE.map((entry) => ({
        id: entry.id,
        referenceId: entry.id,
        aliases: entry.aliases,
        examples: [`${entry.title} là gì?`, `Giải thích ${entry.title}`, `Tra cứu ${entry.title}`],
      })),
    },
    null,
    2,
  ) + '\n',
);
