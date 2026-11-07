import test from "node:test";
import assert from "node:assert/strict";
import { parseMcpServerCatalog } from "../../src/server/cloud/mcp.ts";
import { sealCloudCredential, unsealCloudCredential } from "../../src/server/cloud/credentials.ts";

const validCatalog = JSON.stringify([{ id: "company-tools", name: "Company Tools", url: "https://mcp.example.com/mcp" }]);

test("MCP catalog accepts unique HTTPS server entries without credentials", () => {
  assert.deepEqual(parseMcpServerCatalog(validCatalog), [{ id: "company-tools", name: "Company Tools", url: "https://mcp.example.com/mcp" }]);
});

test("MCP catalog rejects invalid, duplicate, or non-HTTPS endpoints", () => {
  assert.deepEqual(parseMcpServerCatalog("not-json"), []);
  assert.deepEqual(parseMcpServerCatalog(JSON.stringify([{ id: "local", name: "Local", url: "http://127.0.0.1/mcp" }])), []);
  assert.deepEqual(parseMcpServerCatalog(JSON.stringify([
    { id: "duplicate", name: "First", url: "https://first.example/mcp" },
    { id: "duplicate", name: "Second", url: "https://second.example/mcp" },
  ])), []);
});

test("credential encryption authenticates ciphertext and round-trips with a 32-byte key", () => {
  const previous = process.env.CLOUD_CREDENTIALS_KEY;
  process.env.CLOUD_CREDENTIALS_KEY = "a".repeat(64);
  try {
    const secret = "user-access-token-never-log";
    const sealed = sealCloudCredential(secret);
    assert.notEqual(sealed, secret);
    assert.equal(unsealCloudCredential(sealed), secret);
    assert.throws(() => unsealCloudCredential(`${sealed}tampered`));
  } finally {
    if (previous === undefined) delete process.env.CLOUD_CREDENTIALS_KEY;
    else process.env.CLOUD_CREDENTIALS_KEY = previous;
  }
});
