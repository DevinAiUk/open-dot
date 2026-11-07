import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "../../../../server/cloud/auth";
import { getCloudDb } from "../../../../server/cloud/db";
import { workspaceMembers, workspaces, mcpConnections } from "../../../../server/cloud/schema";
import { mcpServerCatalog } from "../../../../server/cloud/mcp";
import McpSettings from "./mcp-settings";

export const dynamic = "force-dynamic";

export default async function McpSettingsPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const memberships = await getCloudDb().select({ id: workspaces.id, name: workspaces.name, role: workspaceMembers.role })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, session.user.id));
  const servers = mcpServerCatalog().map(({ id, name }) => ({ id, name }));
  const initialConnections = memberships.length
    ? await getCloudDb().select({ workspaceId: mcpConnections.workspaceId, serverId: mcpConnections.serverId, connectedAt: mcpConnections.connectedAt, verifiedAt: mcpConnections.verifiedAt })
      .from(mcpConnections)
      .where(inArray(mcpConnections.workspaceId, memberships.map((workspace) => workspace.id)))
    : [];
  const connections = initialConnections.map((row) => ({
    ...row,
    connectedAt: row.connectedAt.toISOString(),
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    name: servers.find((server) => server.id === row.serverId)?.name ?? row.serverId,
  }));
  return <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
    <header><p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Works AI · Hosted</p><h1 className="mt-2 text-3xl font-semibold">MCP connections</h1><p className="mt-2 text-sm text-muted-foreground">Connections are scoped to the selected workspace. Credentials are encrypted at rest and are never returned to the browser after submission.</p></header>
    <McpSettings workspaces={memberships} servers={servers} initialConnections={connections} />
  </main>;
}
