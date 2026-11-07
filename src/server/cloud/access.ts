import "server-only";
import { and, eq } from "drizzle-orm";
import { getCloudDb } from "./db";
import { workspaceMembers } from "./schema";
import { assertWorkspaceMembership, type WorkspaceRole } from "./tenant";

export async function requireWorkspaceMembership(userId: string, workspaceId: string): Promise<WorkspaceRole> {
  const db = getCloudDb();
  const memberships = await db
    .select({ userId: workspaceMembers.userId, workspaceId: workspaceMembers.workspaceId, role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId)))
    .limit(1);

  assertWorkspaceMembership(userId, workspaceId, memberships);
  return (memberships[0]?.role ?? "member") as WorkspaceRole;
}
