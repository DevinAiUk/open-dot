import { eq } from "drizzle-orm";
import { getAuth } from "../../../../server/cloud/auth";
import { getCloudDb } from "../../../../server/cloud/db";
import { requireWorkspaceMembership } from "../../../../server/cloud/access";
import { bots } from "../../../../server/cloud/schema";

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

  const records = await getCloudDb().select({ id: bots.id, name: bots.name, role: bots.role })
    .from(bots)
    .where(eq(bots.workspaceId, workspaceId));
  return Response.json({ bots: records }, { headers: { "Cache-Control": "no-store, private" } });
}
