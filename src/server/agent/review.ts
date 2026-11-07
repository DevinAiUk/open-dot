import "server-only";
import { clientFor, models } from "./client";
import * as repo from "../repo";
import type { Rule, RuleDecision } from "@/lib/types";

// "Your dot knows when to take action, and when to ask for approval."
// Users write rules as "When your dot wants to <action>, it should <allow|ask|never>".
// A small model checks a concrete pending action against those rules. "Ask first" wins conflicts.

export type Verdict = { decision: RuleDecision; rule: Rule | null };

function extractJson<T = unknown>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const clean = text.replace(/```(?:json)?([\s\S]*?)```/gi, "$1").trim();
    try {
      return JSON.parse(clean) as T;
    } catch {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]) as T;
      throw new Error("No JSON found");
    }
  }
}

export async function review(dotId: string, action: string, fallback: RuleDecision): Promise<Verdict> {
  const rules = repo.rulesFor(dotId);
  if (!rules.length) return { decision: fallback, rule: null };

  const list = rules.map((r, i) => `${i + 1}. When the dot wants to ${r.action} → ${r.decision === "allow" ? "allow automatically" : r.decision === "ask" ? "ask first" : "never allow"}`).join("\n");
  try {
    const { client, model, stateless } = clientFor((await models()).review);
    const res = await client.responses.create({
      model,
      ...(stateless ? { store: false } : {}),
      instructions:
        "You gate actions of a personal AI agent. Decide which of the user's rules (if any) apply to the pending action. " +
        "A rule applies only if the action clearly falls under it. Return the numbers of every applying rule; return an empty list if none apply.",
      input: `Rules:\n${list}\n\nPending action: the dot wants to ${action}`,
      text: {
        format: {
          type: "json_schema",
          name: "verdict",
          strict: true,
          schema: {
            type: "object",
            properties: { applying_rules: { type: "array", items: { type: "integer" } } },
            required: ["applying_rules"],
            additionalProperties: false,
          },
        },
      },
    });
    const parsed = extractJson<{ applying_rules?: number[] }>(res.output_text);
    const matched = (parsed.applying_rules ?? []).map((n) => rules[n - 1]).filter(Boolean);
    if (!matched.length) return { decision: fallback, rule: null };
    const pick = (d: RuleDecision) => matched.find((r) => r.decision === d);
    const rule = pick("never") ?? pick("ask") ?? pick("allow")!;
    return { decision: rule.decision, rule };
  } catch {
    // If the reviewer is unavailable, be conservative for anything not explicitly safe.
    return { decision: fallback === "allow" ? "allow" : "ask", rule: null };
  }
}
