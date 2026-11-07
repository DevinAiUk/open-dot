import test from "node:test";
import assert from "node:assert/strict";
import { assertWorkspaceMembership, assertWorkspaceWriteAccess } from "../../src/server/cloud/tenant.ts";

test("allows a user to access a workspace they belong to", () => {
  assert.equal(
    assertWorkspaceMembership("user-a", "tenant-a", [
      { userId: "user-a", workspaceId: "tenant-a" },
    ]),
    "tenant-a",
  );
});

test("rejects a workspace without a matching membership", () => {
  assert.throws(
    () => assertWorkspaceMembership("user-a", "tenant-b", [{ userId: "user-a", workspaceId: "tenant-a" }]),
    /not a member/,
  );
});

test("does not let a caller use another user's membership", () => {
  assert.throws(
    () => assertWorkspaceMembership("user-a", "tenant-a", [{ userId: "user-b", workspaceId: "tenant-a" }]),
    /not a member/,
  );
});

test("denies workspace writes to read-only members", () => {
  assert.throws(() => assertWorkspaceWriteAccess("viewer"), /read-only/);
});

test("allows editors to write within their workspace", () => {
  assert.equal(assertWorkspaceWriteAccess("editor"), "editor");
});
