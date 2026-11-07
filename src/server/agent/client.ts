import "server-only";
import OpenAI from "openai";
import { getSetting, setSetting } from "../db";
import { seal, unseal } from "../vault";
import { isOpenRouterModel, openModels, openRouterId, openRouterKey, openrouter, preferredOpenModel, resetOpenModelsCache, smallOpenModel } from "./openrouter";
import { isOllamaModel, ollama, ollamaId, ollamaKey, ollamaModels, ollamaSource, preferredOllamaModel, resetOllamaCache, smallOllamaModel } from "./ollama";
import { isLlamaCppModel, llamaCppId, llamaCppKey, llamaCppModels, llamaCppSource, llamacpp, preferredLlamaCppModel, resetLlamaCppCache, smallLlamaCppModel } from "./llamacpp";

// Models are chosen from what the API key can actually use. Precedence for a dot's model:
// the dot's own choice → the default picked in Settings → DOTS_MODEL → best available.
const MAIN_PREFERENCE = ["gpt-5.5", "gpt-5.4", "gpt-5.2", "gpt-5.1", "gpt-5"];
const REVIEW_PREFERENCE = ["gpt-5.4-mini", "gpt-5-mini", "gpt-5.4-nano", "gpt-5-nano", "gpt-4.1-mini"];

const g = globalThis as unknown as {
  __dotsOpenAI?: OpenAI;
  __dotsOpenAIKey?: string;
  __dotsModels?: Promise<{ main: string; review: string; available: string[] }>;
  __dotsResolved?: { main: string; review: string; available: string[] };
};

// The key comes from OPENAI_API_KEY / CODEX_API_KEY (development) or from Settings, sealed with the vault key (the desktop app).
const KEY_SETTING = "openai_key";

function apiKey(): string | null {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  if (process.env.CODEX_API_KEY) return process.env.CODEX_API_KEY;
  const sealed = getSetting(KEY_SETTING);
  if (!sealed) return null;
  try {
    return unseal(sealed);
  } catch {
    return null;
  }
}

export function hasKey(): boolean {
  return Boolean(apiKey());
}

/** Where the key came from, for Settings. */
export function keySource(): "env" | "settings" | null {
  return (process.env.OPENAI_API_KEY || process.env.CODEX_API_KEY) ? "env" : getSetting(KEY_SETTING) ? "settings" : null;
}

export function keyEnvVar(): "OPENAI_API_KEY" | "CODEX_API_KEY" | null {
  if (process.env.OPENAI_API_KEY) return "OPENAI_API_KEY";
  if (process.env.CODEX_API_KEY) return "CODEX_API_KEY";
  return null;
}

export function openai(): OpenAI {
  const key = apiKey();
  if (!key) throw new Error("No OpenAI or Codex API key yet. Add one in Settings or set OPENAI_API_KEY / CODEX_API_KEY.");
  const baseURL = process.env.OPENAI_BASE_URL || process.env.CODEX_BASE_URL || undefined;
  const cacheKey = `${key}|${baseURL ?? ""}`;
  if (!g.__dotsOpenAI || g.__dotsOpenAIKey !== cacheKey) {
    g.__dotsOpenAI = new OpenAI({ apiKey: key, baseURL });
    g.__dotsOpenAIKey = cacheKey;
  }
  return g.__dotsOpenAI;
}

/** Check the key works, then save it (encrypted) and re-pick models for it. Returns an error message or null. */
export async function saveApiKey(key: string): Promise<string | null> {
  try {
    await new OpenAI({ apiKey: key }).models.list();
  } catch (err) {
    return err instanceof Error && /401|Incorrect API key|invalid/i.test(err.message) ? "OpenAI didn't accept that key." : `Couldn't check the key: ${err instanceof Error ? err.message : String(err)}`;
  }
  setSetting(KEY_SETTING, seal(key));
  resetModels();
  return null;
}

/** Chat-capable models worth offering in a picker (no audio/image/embedding/realtime variants). */
function isAgentModel(id: string): boolean {
  if (/codex/i.test(id)) return true;
  if (!/^(gpt-[4-9]|o[1-9])/.test(id)) return false;
  if (/audio|realtime|transcribe|tts|image|embedding|search|instruct|moderation|chat-latest|-\d{4}-\d{2}-\d{2}$|0613|0314|1106|0125|preview/.test(id)) return false;
  return !/^gpt-4(-|$)|gpt-4o|gpt-4-turbo|gpt-3/.test(id);
}

function rank(id: string): number {
  const m = id.match(/^gpt-(\d+)(?:\.(\d+))?/);
  const version = m ? Number(m[1]) * 100 + Number(m[2] ?? 0) : id.startsWith("o") ? 400 : 0;
  const tier = /-(pro)/.test(id) ? 0.5 : /-(mini)/.test(id) ? -0.3 : /-(nano)/.test(id) ? -0.6 : 0;
  return version + tier;
}

async function resolveOpenAI(): Promise<{ main: string; review: string; available: string[] } | null> {
  if (!apiKey()) return null;
  let ids: string[] = [];
  try {
    for await (const m of openai().models.list()) ids.push(m.id);
  } catch (err) {
    console.warn("[dots] couldn't list models, using defaults:", err instanceof Error ? err.message : err);
    ids = [];
  }
  const set = new Set(ids);
  const pick = (envVar: string | undefined, prefs: string[]) => envVar || prefs.find((id) => set.has(id)) || prefs[0];
  const available = ids.filter(isAgentModel).sort((a, b) => rank(b) - rank(a) || a.localeCompare(b));
  return {
    main: pick(process.env.DOTS_MODEL, MAIN_PREFERENCE),
    review: pick(process.env.DOTS_REVIEW_MODEL, REVIEW_PREFERENCE),
    available: available.length ? available : MAIN_PREFERENCE,
  };
}

/** OpenAI/Codex models first, then open models (OpenRouter), then Ollama models, then llama.cpp models. */
async function resolve() {
  const [oa, open, ol, lc] = await Promise.all([
    resolveOpenAI(),
    openModels().catch((err) => {
      console.warn("[dots] couldn't list OpenRouter models:", err instanceof Error ? err.message : err);
      return [] as string[];
    }),
    ollamaModels().catch((err) => {
      console.warn("[dots] couldn't list Ollama models:", err instanceof Error ? err.message : err);
      return [] as string[];
    }),
    llamaCppModels().catch((err) => {
      console.warn("[dots] couldn't list llama.cpp models:", err instanceof Error ? err.message : err);
      return [] as string[];
    }),
  ]);
  const resolved = {
    main:
      oa?.main ??
      (open.length
        ? preferredOpenModel(open)
        : ol.length
          ? preferredOllamaModel(ol)
          : lc.length
            ? preferredLlamaCppModel(lc)
            : process.env.DOTS_MODEL || MAIN_PREFERENCE[0]),
    review:
      oa?.review ??
      (open.length
        ? smallOpenModel(open)
        : ol.length
          ? smallOllamaModel(ol)
          : lc.length
            ? smallLlamaCppModel(lc)
            : process.env.DOTS_REVIEW_MODEL || REVIEW_PREFERENCE[0]),
    available: [...(oa?.available ?? []), ...open, ...ol, ...lc],
  };
  g.__dotsResolved = resolved;
  console.log(`[dots] default ${resolved.main} (agent), ${resolved.review} (rule review); ${resolved.available.length} models available`);
  return resolved;
}

/** Forget the resolved model list (a key was added or removed, or models refreshed). */
export function resetModels() {
  resetOpenModelsCache();
  resetOllamaCache();
  resetLlamaCppCache();
  g.__dotsModels = undefined;
  g.__dotsResolved = undefined;
}

/** The API client for a model, the model id that API expects, and whether it keeps conversation state. */
export function clientFor(model: string): { client: OpenAI; model: string; stateless: boolean } {
  if (isOpenRouterModel(model)) return { client: openrouter(), model: openRouterId(model), stateless: true };
  if (isOllamaModel(model)) return { client: ollama(), model: ollamaId(model), stateless: true };
  if (isLlamaCppModel(model)) return { client: llamacpp(), model: llamaCppId(model), stateless: true };
  return { client: openai(), model, stateless: false };
}

/** True when any model provider is set up (OpenAI/Codex, OpenRouter, Ollama, or llama.cpp). */
export function canThink(): boolean {
  return hasKey() || Boolean(openRouterKey()) || Boolean(ollamaKey() || ollamaSource()) || Boolean(llamaCppKey() || llamaCppSource());
}

export function models(): Promise<{ main: string; review: string; available: string[] }> {
  g.__dotsModels ??= resolve().catch((err) => {
    g.__dotsModels = undefined;
    throw err;
  });
  return g.__dotsModels;
}

/** The model a dot should run on right now. */
export async function modelFor(dotModel: string | null): Promise<string> {
  if (dotModel) {
    if (isOllamaModel(dotModel) && !ollamaKey() && !ollamaSource()) {
      return getSetting("default_model") ?? (await models()).main;
    }
    if (isLlamaCppModel(dotModel) && !llamaCppKey() && !llamaCppSource()) {
      return getSetting("default_model") ?? (await models()).main;
    }
    if (isOpenRouterModel(dotModel) && !openRouterKey()) {
      return getSetting("default_model") ?? (await models()).main;
    }
    return dotModel;
  }
  return getSetting("default_model") ?? (await models()).main;
}

/** Best-known model info for display, without blocking. */
export function knownModels(): { main: string; review: string; available: string[]; defaultModel: string } {
  const r = g.__dotsResolved ?? { main: process.env.DOTS_MODEL || MAIN_PREFERENCE[0], review: process.env.DOTS_REVIEW_MODEL || REVIEW_PREFERENCE[0], available: [] };
  return { ...r, defaultModel: getSetting("default_model") ?? r.main };
}

/** gpt-5.x / gpt-6 / o-series accept `reasoning`; gpt-4.1 and friends reject it. */
export function isReasoningModel(model: string): boolean {
  return !isOpenRouterModel(model) && !isOllamaModel(model) && !isLlamaCppModel(model) && /^(gpt-[5-9]|o[1-9])/.test(model) && !/chat/.test(model);
}

/** OpenAI's GA computer tool needs a recent model; older ones get the page-reading tools only. */
export function supportsComputerTool(model: string): boolean {
  return !isOpenRouterModel(model) && !isOllamaModel(model) && !isLlamaCppModel(model) && /^gpt-5\.[4-9]|^gpt-[6-9]|computer-use/.test(model);
}
