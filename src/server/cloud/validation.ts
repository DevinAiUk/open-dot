export interface ConversationInput {
  title: string;
  botId: string;
}

export function parseMessageBody(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const body = value.trim();
  if (!body || body.length > 4000) return null;
  return body;
}

export function parseConversationInput(value: unknown): ConversationInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.title !== "string" || typeof candidate.botId !== "string") return null;
  const title = candidate.title.trim();
  const botId = candidate.botId.trim();
  if (!title || title.length > 120 || !botId || botId.length > 128) return null;
  return { title, botId };
}
