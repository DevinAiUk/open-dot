import test from "node:test";
import assert from "node:assert/strict";
import { classifyHostedPath } from "../../src/server/cloud/routing.ts";

test("hosted mode keeps authentication and login entrypoints public", () => {
  assert.equal(classifyHostedPath("/login"), "public");
  assert.equal(classifyHostedPath("/api/auth/sign-in/email"), "public");
  assert.equal(classifyHostedPath("/api/demo/login"), "public");
});

test("hosted mode protects cloud pages and API routes", () => {
  assert.equal(classifyHostedPath("/cloud"), "protected");
  assert.equal(classifyHostedPath("/cloud/bots"), "protected");
  assert.equal(classifyHostedPath("/api/cloud/bots"), "protected");
});

test("hosted mode blocks desktop routes but permits static assets", () => {
  assert.equal(classifyHostedPath("/"), "blocked");
  assert.equal(classifyHostedPath("/settings"), "blocked");
  assert.equal(classifyHostedPath("/api/dots"), "blocked");
  assert.equal(classifyHostedPath("/_next/static/chunk.js"), "asset");
  assert.equal(classifyHostedPath("/icon.png"), "asset");
});
