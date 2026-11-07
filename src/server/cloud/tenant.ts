export type WorkspaceMembership = { userId: string; workspaceId: string };
export type WorkspaceRole = "owner" | "editor" | "member" | "viewer";

/** Fail closed unless the verified user has membership in the requested workspace. */
export function assertWorkspaceMembership(userId: string, workspaceId: string, memberships: WorkspaceMembership[]): string {
  if (!memberships.some((membership) => membership.userId === userId && membership.workspaceId === workspaceId)) {
    throw new Error("User is not a member of this workspace.");
  }
  return workspaceId;
}

/** Demo and viewer accounts may read but cannot create or modify workspace data. */
export function assertWorkspaceWriteAccess(role: string): WorkspaceRole {
  if (role !== "owner" && role !== "editor") throw new Error("This workspace is read-only for this account.");
  return role;
}
