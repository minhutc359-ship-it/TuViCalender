import { readFileSync } from 'node:fs';
import { setKnowledgeGroup } from '../src/features/knowledge/catalog';
for (const id of ['core', 'eastern', 'western', 'tarot'])
  setKnowledgeGroup(
    id,
    JSON.parse(readFileSync(`public/content/${id}/knowledge.vi.json`, 'utf8')).entries,
  );
