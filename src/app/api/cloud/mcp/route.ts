import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getAuth } from "../../../../server/cloud/auth";
import { getCloudDb } from "../../../../server/cloud/db";
import { requireWorkspaceMembership } from "../../../../server/cloud/access";
import { assertWorkspaceWriteAccess } from "../../../../server/cloud/tenant";
import { mcpConnections } from "../../../../server/cloud/schema";
import { mcpServerCatalog, verifyMcpServer } from "../../../../server/cloud/mcp";
import { sealCloudCredential } from "../../../../server/cloud/credentials";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function authenticatedWorkspace(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) return { response: jsonError("Authentication required", 401) };
  const workspaceId = new URL(request.url).searchParams.get("workspaceId")?.trim();
  if (!workspaceId) return { response: jsonError("workspaceId is required", 400) };
  let role;
  try { role = await requireWorkspaceMembership(session.user.id, workspaceId); }
  catch { return { response: jsonError("Workspace not found", 404) }; }
  return { session, workspaceId, role };
}

export async function GET(request: Request) {
  const context = await authenticatedWorkspace(request);
  if ("response" in context) return context.response;
  const rows = await getCloudDb().select({ serverId: mcpConnections.serverId, connectedAt: mcpConnections.connectedAt, verifiedAt: mcpConnections.verifiedAt })
    .from(mcpConnections)
    .where(eq(mcpConnections.workspaceId, context.workspaceId));
  const catalog = mcpServerCatalog();
  return Response.json({
    catalog: catalog.map(({ id, name }) => ({ id, name })),
    connections: rows.map((row) => ({ ...row, name: catalog.find((server) => server.id === row.serverId)?.name ?? row.serverId })),
  }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(request: Request) {
  const context = await authenticatedWorkspace(request);
  if ("response" in context) return context.response;
  try { assertWorkspaceWriteAccess(context.role); }
  catch { return jsonError("Workspace write access required", 403); }

  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Invalid request body", 400); }
  if (!payload || typeof payload !== "object") return jsonError("Invalid request body", 400);
  const body = payload as Record<string, unknown>;
  const serverId = typeof body.serverId === "string" ? body.serverId : "";
  const credential = typeof body.credential === "string" ? body.credential.trim() : "";
  if (!credential || credential.length > 8192) return jsonError("Provide a valid access token", 400);
  const server = mcpServerCatalog().find((entry) => entry.id === serverId);
  if (!server) return jsonError("MCP server is not in the approved server catalog", 400);

  let toolCount: number;
  try { toolCount = await verifyMcpServer(server.url, credential); }
  catch { return jsonError("MCP verification failed. Check the token and server availability; no credential was saved.", 502); }

  const sealedCredential = sealCloudCredential(credential);
  await getCloudDb().insert(mcpConnections).values({
    id: randomUUID(), workspaceId: context.workspaceId, serverId: server.id,
    endpoint: server.url, sealedCredential, verifiedAt: new Date(),
  }).onConflictDoUpdate({
    target: [mcpConnections.workspaceId, mcpConnections.serverId],
    set: { endpoint: server.url, sealedCredential, verifiedAt: new Date() },
  });
  return Response.json({ connected: true, serverId: server.id, verified: true, toolCount }, { status: 201, headers: { "Cache-Control": "no-store, private" } });
}

export async function DELETE(request: Request) {
  const context = await authenticatedWorkspace(request);
  if ("response" in context) return context.response;
  try { assertWorkspaceWriteAccess(context.role); }
  catch { return jsonError("Workspace write access required", 403); }
  const serverId = new URL(request.url).searchParams.get("serverId")?.trim();
  if (!serverId || !mcpServerCatalog().some((server) => server.id === serverId)) return jsonError("Unknown serverId", 400);
  await getCloudDb().delete(mcpConnections).where(and(eq(mcpConnections.workspaceId, context.workspaceId), eq(mcpConnections.serverId, serverId)));
  return Response.json({ disconnected: true, serverId }, { headers: { "Cache-Control": "no-store, private" } });
}
