import type { AIMessage } from '../../lib/openai';
import { isChatPersona } from '../../lib/chat-personas';
import { SOURCE_LABELS } from './engine';
export const validMessages = (value: unknown): value is AIMessage[] =>
  Array.isArray(value) &&
  value.length <= 100 &&
  value.every(
    (m) =>
      m &&
      (m.role === 'user' || m.role === 'assistant') &&
      (m.persona === undefined || isChatPersona(m.persona)) &&
      typeof m.content === 'string' &&
      m.content.length <= 12000 &&
      (m.response === undefined ||
        (m.response &&
          typeof m.response.content === 'string' &&
          Object.hasOwn(SOURCE_LABELS, m.response.source) &&
          (m.response.references === undefined ||
            (Array.isArray(m.response.references) &&
              m.response.references.length <= 10 &&
              m.response.references.every(
                (r: any) =>
                  r &&
                  typeof r.id === 'string' &&
                  typeof r.title === 'string' &&
                  r.title.length <= 300,
              ))) &&
          (m.response.actions === undefined ||
            (Array.isArray(m.response.actions) &&
              m.response.actions.length <= 10 &&
              m.response.actions.every(
                (a: any) =>
                  a &&
                  typeof a.label === 'string' &&
                  a.label.length <= 200 &&
                  typeof a.route === 'string' &&
                  /^\/(knowledge|calendar|tarot|profile|oracle)(\?[^\s]*)?$/.test(a.route),
              ))))),
  );
