import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getAuth } from "../../../../../../server/cloud/auth";
import { getCloudDb } from "../../../../../../server/cloud/db";
import { requireWorkspaceMembership } from "../../../../../../server/cloud/access";
import { assertWorkspaceWriteAccess } from "../../../../../../server/cloud/tenant";
import { conversations, messages } from "../../../../../../server/cloud/schema";
import { parseMessageBody } from "../../../../../../server/cloud/validation";

type RouteContext = { params: Promise<{ id: string }> };

async function authorizedConversation(request: Request, context: RouteContext) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) return { response: Response.json({ error: "Authentication required" }, { status: 401, headers: { "Cache-Control": "no-store" } }) };
  const workspaceId = new URL(request.url).searchParams.get("workspaceId")?.trim();
  if (!workspaceId) return { response: Response.json({ error: "workspaceId is required" }, { status: 400, headers: { "Cache-Control": "no-store" } }) };
  try {
    await requireWorkspaceMembership(session.user.id, workspaceId);
  } catch {
    return { response: Response.json({ error: "Workspace not found" }, { status: 404, headers: { "Cache-Control": "no-store" } }) };
  }
  const { id } = await context.params;
  const [conversation] = await getCloudDb().select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.workspaceId, workspaceId)))
    .limit(1);
  if (!conversation) return { response: Response.json({ error: "Conversation not found" }, { status: 404, headers: { "Cache-Control": "no-store" } }) };
  return { conversation, session, workspaceId };
}

export async function GET(request: Request, context: RouteContext) {
  const authorization = await authorizedConversation(request, context);
  if ("response" in authorization) return authorization.response;
  const records = await getCloudDb().select({ id: messages.id, role: messages.role, body: messages.body, createdAt: messages.createdAt })
    .from(messages)
    .where(and(eq(messages.workspaceId, authorization.workspaceId), eq(messages.conversationId, authorization.conversation.id)))
    .orderBy(desc(messages.createdAt))
    .limit(100);
  return Response.json({ messages: records.reverse() }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizedConversation(request, context);
  if ("response" in authorization) return authorization.response;
  try {
    const role = await requireWorkspaceMembership(authorization.session.user.id, authorization.workspaceId);
    assertWorkspaceWriteAccess(role);
  } catch {
    return Response.json({ error: "Workspace write access required" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  let payload: unknown;
  try { payload = await request.json(); } catch { payload = null; }
  const body = payload && typeof payload === "object" ? parseMessageBody((payload as Record<string, unknown>).body) : null;
  if (!body) return Response.json({ error: "Message body must be 1–4000 characters" }, { status: 400, headers: { "Cache-Control": "no-store" } });

  const [created] = await getCloudDb().insert(messages).values({
    id: randomUUID(),
    workspaceId: authorization.workspaceId,
    conversationId: authorization.conversation.id,
    role: "user",
    body,
  }).returning({ id: messages.id, role: messages.role, body: messages.body, createdAt: messages.createdAt });
  return Response.json({ message: created }, { status: 201, headers: { "Cache-Control": "no-store, private" } });
}
