export interface ChatBody {
  message: string;
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  context: Record<string, unknown>;
}
export function validateChatBody(value: unknown): ChatBody | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 4000)
    return null;
  const history = body.chatHistory ?? [];
  if (
    !Array.isArray(history) ||
    history.length > 10 ||
    history.some(
      (m) =>
        !m ||
        !['user', 'assistant'].includes(m.role) ||
        typeof m.content !== 'string' ||
        m.content.length > 12000,
    )
  )
    return null;
  const context = body.context;
  if (
    context !== undefined &&
    (!context ||
      typeof context !== 'object' ||
      Array.isArray(context) ||
      JSON.stringify(context).length > 4000)
  )
    return null;
  return {
    message: body.message.trim(),
    chatHistory: history.map((m) => ({ role: m.role, content: m.content })),
    context: (context ?? {}) as Record<string, unknown>,
  };
}
