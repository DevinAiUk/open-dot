import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { getAuth } from "../../server/cloud/auth";
import { getCloudDb } from "../../server/cloud/db";
import { bots, workspaceMembers, workspaces } from "../../server/cloud/schema";

export const dynamic = "force-dynamic";

export default async function CloudPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const db = getCloudDb();
  const memberships = await db.select({ id: workspaces.id, name: workspaces.name, role: workspaceMembers.role })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, session.user.id));
  const workspaceBots = memberships.length
    ? await db.select({ id: bots.id, workspaceId: bots.workspaceId, name: bots.name, role: bots.role })
      .from(bots)
      .where(inArray(bots.workspaceId, memberships.map((workspace) => workspace.id)))
    : [];

  return <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
    <header>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Works AI · Hosted</p>
      <h1 className="mt-2 text-3xl font-semibold">Welcome, {session.user.name}</h1>
      <p className="mt-2 text-muted-foreground">Tenant-isolated workspace preview.</p>
      <Link href="/cloud/settings/mcp" className="mt-4 inline-flex rounded-lg border px-3 py-2 text-sm font-medium">Manage MCP connections</Link>
    </header>
    {memberships.length === 0 ? <p>No workspace is provisioned for this account yet.</p> : memberships.map((workspace) => <section key={workspace.id} className="rounded-xl border p-5">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-xl font-semibold">{workspace.name}</h2><p className="text-sm text-muted-foreground">Role: {workspace.role}</p></div>
        <span className="rounded-md border px-2 py-1 text-xs">{workspaceBots.filter((bot) => bot.workspaceId === workspace.id).length} Bots</span>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {workspaceBots.filter((bot) => bot.workspaceId === workspace.id).map((bot) => <li key={bot.id} className="rounded-lg bg-muted/40 p-4"><h3 className="font-medium">{bot.name}</h3><p className="text-sm text-muted-foreground">{bot.role}</p></li>)}
      </ul>
    </section>)}
  </main>;
}
