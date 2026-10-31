import { useSyncExternalStore } from 'react';
export interface KnowledgeEntry {
  id: string;
  title: string;
  category: 'eastern' | 'western' | 'tarot' | 'guide';
  aliases: string[];
  content: string;
  source: string;
}
export const KNOWLEDGE_VERSION = 'vi-2026.10.31-1';
export const KNOWLEDGE: KnowledgeEntry[] = [];
const groups = new Map<string, KnowledgeEntry[]>();
const listeners = new Set<() => void>();
let revision = 0;
const valid = (value: unknown): value is KnowledgeEntry[] =>
  Array.isArray(value) &&
  value.length <= 1000 &&
  value.every(
    (e) =>
      e &&
      typeof e.id === 'string' &&
      /^[a-zA-Z0-9-]+$/.test(e.id) &&
      typeof e.title === 'string' &&
      typeof e.content === 'string' &&
      typeof e.source === 'string' &&
      ['eastern', 'western', 'tarot', 'guide'].includes(e.category) &&
      Array.isArray(e.aliases) &&
      e.aliases.every((a: unknown) => typeof a === 'string'),
  ) &&
  new Set(value.map((e) => e.id)).size === value.length;
export function setKnowledgeGroup(pack: string, entries: KnowledgeEntry[]) {
  if (!valid(entries)) throw new Error('Nội dung tra cứu chưa đúng định dạng.');
  groups.set(pack, entries);
  KNOWLEDGE.splice(0, KNOWLEDGE.length, ...[...groups.values()].flat());
  revision++;
  listeners.forEach((fn) => fn());
}
export function useKnowledge() {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => revision,
    () => revision,
  );
  return KNOWLEDGE;
}
export function missingKnowledgePacks() {
  return ['core', 'eastern', 'western', 'tarot'].filter((id) => !groups.has(id));
}
export async function loadKnowledge() {
  await Promise.all(
    ['core', 'eastern', 'western', 'tarot'].map(async (pack) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      try {
        const response = await fetch(`/content/${pack}/knowledge.vi.json`, {
          signal: controller.signal,
          headers:
            typeof navigator !== 'undefined' && !navigator.onLine
              ? { 'X-AstroAI-Cache-Only': '1' }
              : {},
        });
        if (!response.ok) throw new Error('Pack unavailable');
        const body = await response.json();
        if (body.schemaVersion !== 1 || body.locale !== 'vi' || body.id !== pack)
          throw new Error('Pack version unsupported');
        setKnowledgeGroup(pack, body.entries);
      } catch {
        groups.delete(pack);
        KNOWLEDGE.splice(0, KNOWLEDGE.length, ...[...groups.values()].flat());
        revision++;
        listeners.forEach((fn) => fn());
      } finally {
        clearTimeout(timer);
      }
    }),
  );
}
export function normalizeText(text: string) {
  return text
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
export function searchKnowledge(query: string, limit = 20) {
  const q = normalizeText(query);
  if (!q) return KNOWLEDGE.slice(0, limit);
  const words = q.split(' ');
  return KNOWLEDGE.map((entry) => {
    const title = normalizeText([entry.title, ...entry.aliases].join(' '));
    const body = normalizeText(entry.content);
    const tokens = new Set(`${title} ${body}`.split(' '));
    if (!title.includes(q) && !words.every((word) => tokens.has(word))) return { entry, score: 0 };
    return {
      entry,
      score:
        (title.includes(q) ? 20 : 0) +
        words.reduce(
          (n, w) => n + (title.split(' ').includes(w) ? 3 : body.split(' ').includes(w) ? 1 : 0),
          0,
        ),
    };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry);
}
