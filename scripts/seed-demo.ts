import { randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";

const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
const password = process.env.DEMO_PASSWORD;
const name = process.env.DEMO_NAME?.trim() || "Works AI Demo";
if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before provisioning the hosted demo.");
if (!email || !password || password.length < 12) throw new Error("Set DEMO_EMAIL and a DEMO_PASSWORD of at least 12 characters.");

// Enable signup only in this short-lived provisioning process, never in the web server.
process.env.DEMO_SEED_MODE = "true";
const [{ getAuth }, { getCloudDb }, { bots, user, workspaceMembers, workspaces }] = await Promise.all([
  import("../src/server/cloud/auth.ts"),
  import("../src/server/cloud/db.ts"),
  import("../src/server/cloud/schema.ts"),
]);
const db = getCloudDb();

let [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
if (!existingUser) {
  const auth = getAuth();
  const authBaseUrl = process.env.BETTER_AUTH_URL ?? process.env.DOTS_PUBLIC_URL ?? "http://localhost:3000";
  const response = await auth.handler(new Request(new URL("/api/auth/sign-up/email", authBaseUrl), {
    method: "POST",
    headers: { "content-type": "application/json", origin: authBaseUrl },
    body: JSON.stringify({ name, email, password }),
  }));
  if (!response.ok) throw new Error(`Demo user creation failed with HTTP ${response.status}.`);
  [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (!existingUser) throw new Error("Demo sign-up returned successfully but the user record was not found.");
}

const membershipRows = await db.select({ workspace: workspaces, member: workspaceMembers })
  .from(workspaceMembers)
  .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
  .where(and(eq(workspaceMembers.userId, existingUser.id), eq(workspaces.isDemo, true)))
  .limit(1);
let workspaceId = membershipRows[0]?.workspace.id;
if (!workspaceId) {
  workspaceId = `demo-${randomUUID()}`;
  await db.insert(workspaces).values({ id: workspaceId, name: "Works AI Demo", isDemo: true });
  await db.insert(workspaceMembers).values({ workspaceId, userId: existingUser.id, role: "viewer" });
}

const existingBots = await db.select({ id: bots.id }).from(bots).where(eq(bots.workspaceId, workspaceId));
if (existingBots.length === 0) {
  await db.insert(bots).values([
    { id: randomUUID(), workspaceId, name: "Scout", role: "Read-only Researcher", instructions: "Analyze provided material and prepare cited findings. Never write to external services or change workspace configuration." },
    { id: randomUUID(), workspaceId, name: "Planner", role: "Draft-only Workflow Planner", instructions: "Organize approved findings into plans and draft artifacts. Do not publish, send messages, schedule work, or modify external systems." },
  ]);
}

console.log("Demo account and isolated demo workspace are provisioned. No credentials were printed.");
