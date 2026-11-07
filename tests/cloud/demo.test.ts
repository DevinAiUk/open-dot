import test from "node:test";
import assert from "node:assert/strict";
import { isDemoLoginConfigured } from "../../src/server/cloud/demo.ts";

test("demo login is disabled unless explicitly enabled with credentials", () => {
  assert.equal(isDemoLoginConfigured({}), false);
  assert.equal(isDemoLoginConfigured({ DEMO_LOGIN_ENABLED: "true" }), false);
  assert.equal(isDemoLoginConfigured({ DEMO_LOGIN_ENABLED: "false", DEMO_EMAIL: "demo@example.com", DEMO_PASSWORD: "secret" }), false);
});

test("demo login becomes available only with all explicit settings", () => {
  assert.equal(isDemoLoginConfigured({ DEMO_LOGIN_ENABLED: "true", DEMO_EMAIL: "demo@example.com", DEMO_PASSWORD: "secret" }), true);
});
