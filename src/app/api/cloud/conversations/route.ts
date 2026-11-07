import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getAuth } from "../../../../server/cloud/auth";
import { getCloudDb } from "../../../../server/cloud/db";
import { requireWorkspaceMembership } from "../../../../server/cloud/access";
import { assertWorkspaceWriteAccess } from "../../../../server/cloud/tenant";
import { bots, conversations } from "../../../../server/cloud/schema";
import { parseConversationInput } from "../../../../server/cloud/validation";

export async function GET(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Authentication required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const workspaceId = new URL(request.url).searchParams.get("workspaceId")?.trim();
  if (!workspaceId) return Response.json({ error: "workspaceId is required" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  try {
    await requireWorkspaceMembership(session.user.id, workspaceId);
  } catch {
    return Response.json({ error: "Workspace not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const records = await getCloudDb().select({ id: conversations.id, botId: conversations.botId, title: conversations.title, createdAt: conversations.createdAt })
    .from(conversations)
    .where(eq(conversations.workspaceId, workspaceId))
    .orderBy(desc(conversations.createdAt));
  return Response.json({ conversations: records }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Authentication required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const workspaceId = new URL(request.url).searchParams.get("workspaceId")?.trim();
  if (!workspaceId) return Response.json({ error: "workspaceId is required" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  let role;
  try {
    role = await requireWorkspaceMembership(session.user.id, workspaceId);
    assertWorkspaceWriteAccess(role);
  } catch {
    return Response.json({ error: "Workspace write access required" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  let payload: unknown;
  try { payload = await request.json(); } catch { payload = null; }
  const input = parseConversationInput(payload);
  if (!input) return Response.json({ error: "Invalid conversation payload" }, { status: 400, headers: { "Cache-Control": "no-store" } });

  const db = getCloudDb();
  const [bot] = await db.select({ id: bots.id }).from(bots)
    .where(and(eq(bots.id, input.botId), eq(bots.workspaceId, workspaceId))).limit(1);
  if (!bot) return Response.json({ error: "Bot not found in this workspace" }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const [created] = await db.insert(conversations).values({ id: randomUUID(), workspaceId, botId: input.botId, title: input.title }).returning({
    id: conversations.id,
    botId: conversations.botId,
    title: conversations.title,
    createdAt: conversations.createdAt,
  });
  return Response.json({ conversation: created }, { status: 201, headers: { "Cache-Control": "no-store, private" } });
}
