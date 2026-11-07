import test from "node:test";
import assert from "node:assert/strict";
import { parseConversationInput, parseMessageBody } from "../../src/server/cloud/validation.ts";

test("conversation payloads normalize valid title and bot identifier", () => {
  assert.deepEqual(parseConversationInput({ title: "  Quarterly planning  ", botId: "bot-123" }), {
    title: "Quarterly planning",
    botId: "bot-123",
  });
});

test("conversation payloads reject missing, blank, or oversized fields", () => {
  assert.equal(parseConversationInput({ title: " ", botId: "bot-123" }), null);
  assert.equal(parseConversationInput({ title: "Planning", botId: " " }), null);
  assert.equal(parseConversationInput({ title: "x".repeat(121), botId: "bot-123" }), null);
  assert.equal(parseConversationInput(null), null);
});

test("message bodies are trimmed and bounded", () => {
  assert.equal(parseMessageBody("  Find three risks.  "), "Find three risks.");
  assert.equal(parseMessageBody("  "), null);
  assert.equal(parseMessageBody("x".repeat(4001)), null);
  assert.equal(parseMessageBody(42), null);
});
