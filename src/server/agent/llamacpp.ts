import "server-only";
import OpenAI from "openai";
import { getSetting, setSetting } from "../db";
import { seal, unseal } from "../vault";
import { stripThinking } from "./ollama";

// llama.cpp server (llama-server) support.
// Default local endpoint: http://localhost:8080/v1
// Model IDs in open-dot use a "llamacpp:" prefix, e.g. "llamacpp:default" or "llamacpp:qwen2.5-coder".

export const LLAMACPP_PREFIX = "llamacpp:";
const KEY_SETTING = "llamacpp_key";
const URL_SETTING = "llamacpp_url";
const DEFAULT_URL = "http://localhost:8080/v1";

const MAIN_PREFERENCE = [/coder/i, /qwen/i, /deepseek/i, /llama/i, /mistral/i, /gemma/i];
const SMALL_PREFERENCE = [/(\b(1|2|3|4|7|8)b\b|-mini|-nano)/i, /qwen/i, /llama/i];

const g = globalThis as unknown as {
  __dotsLlamaCpp?: { key: string; url: string; client: OpenAI };
  __dotsLlamaCppModels?: { at: number; ids: string[] };
  __dotsLlamaCppLocalAvailable?: boolean;
};

export const isLlamaCppModel = (model: string) => model.startsWith(LLAMACPP_PREFIX);
export const llamaCppId = (model: string) => model.slice(LLAMACPP_PREFIX.length);

function cleanUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, "");
  if (!u.endsWith("/v1")) {
    u = `${u}/v1`;
  }
  return u;
}

export function llamaCppBaseUrl(): string {
  if (process.env.LLAMACPP_BASE_URL) return cleanUrl(process.env.LLAMACPP_BASE_URL);
  const settingUrl = getSetting(URL_SETTING);
  if (settingUrl) return cleanUrl(settingUrl);
  return DEFAULT_URL;
}

export function llamaCppKey(): string | null {
  if (process.env.LLAMACPP_API_KEY) return process.env.LLAMACPP_API_KEY;
  const sealed = getSetting(KEY_SETTING);
  if (!sealed) return null;
  try {
    return unseal(sealed);
  } catch {
    return null;
  }
}

export function llamaCppSource(): "env" | "settings" | "local" | null {
  if (process.env.LLAMACPP_BASE_URL || process.env.LLAMACPP_API_KEY) return "env";
  if (getSetting(KEY_SETTING) || getSetting(URL_SETTING)) return "settings";
  if (g.__dotsLlamaCppLocalAvailable) return "local";
  return null;
}

export function resetLlamaCppCache() {
  g.__dotsLlamaCpp = undefined;
  g.__dotsLlamaCppModels = undefined;
}

/** Check and save llama.cpp server credentials/URL (empty key/url clears them). */
export async function saveLlamaCppConfig(key: string, url?: string): Promise<string | null> {
  if (process.env.LLAMACPP_API_KEY && key) return "LLAMACPP_API_KEY is already set in your environment (.env).";
  const trimmedKey = key.trim();
  const trimmedUrl = url?.trim();

  if (!trimmedKey && !trimmedUrl) {
    setSetting(KEY_SETTING, null);
    setSetting(URL_SETTING, null);
    resetLlamaCppCache();
    return null;
  }

  const testUrl = cleanUrl(trimmedUrl || DEFAULT_URL);
  try {
    const headers: Record<string, string> = {};
    if (trimmedKey) headers["Authorization"] = `Bearer ${trimmedKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${testUrl}/models`, { headers, signal: controller.signal }).catch(async () => {
      // Fallback check to root props/health endpoint if /models returns error or aborts
      const rootUrl = testUrl.replace(/\/v1$/, "");
      return await fetch(`${rootUrl}/props`, { headers, signal: controller.signal }).catch(() => null);
    });
    clearTimeout(timeout);

    if (res) {
      if (res.status === 401 || res.status === 403) return "llama.cpp server didn't accept that API key.";
      if (!res.ok && res.status !== 404) return `Couldn't connect to llama.cpp server (${res.status}).`;
    }
  } catch (err) {
    return `Couldn't reach llama.cpp server: ${err instanceof Error ? err.message : String(err)}`;
  }

  if (trimmedKey) setSetting(KEY_SETTING, seal(trimmedKey));
  else setSetting(KEY_SETTING, null);

  if (trimmedUrl) setSetting(URL_SETTING, trimmedUrl);
  else setSetting(URL_SETTING, null);

  resetLlamaCppCache();
  return null;
}

/** Fetch available models from llama.cpp server. Cached for 60 seconds. */
export async function llamaCppModels(): Promise<string[]> {
  const baseURL = llamaCppBaseUrl();
  const key = llamaCppKey();
  if (g.__dotsLlamaCppModels && Date.now() - g.__dotsLlamaCppModels.at < 60_000) {
    return g.__dotsLlamaCppModels.ids;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const headers: Record<string, string> = {};
    if (key) headers["Authorization"] = `Bearer ${key}`;
    const res = await fetch(`${baseURL}/models`, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      // If /models returned 404, check /props endpoint on root
      const rootUrl = baseURL.replace(/\/v1$/, "");
      const propsRes = await fetch(`${rootUrl}/props`, { headers }).catch(() => null);
      if (propsRes && propsRes.ok) {
        const ids = [LLAMACPP_PREFIX + "default"];
        g.__dotsLlamaCppModels = { at: Date.now(), ids };
        if (baseURL.includes("localhost") || baseURL.includes("127.0.0.1")) {
          g.__dotsLlamaCppLocalAvailable = true;
        }
        return ids;
      }
      if (baseURL.includes("localhost") || baseURL.includes("127.0.0.1")) {
        g.__dotsLlamaCppLocalAvailable = false;
      }
      return [];
    }

    const json = (await res.json()) as { data?: { id: string }[]; models?: { name: string }[] };
    const rawIds = (json.data?.map((m) => m.id) ?? json.models?.map((m) => m.name) ?? []).filter(Boolean);
    const resolvedIds = rawIds.length > 0 ? rawIds : ["default"];
    const ids = resolvedIds.map((id) => LLAMACPP_PREFIX + id);
    g.__dotsLlamaCppModels = { at: Date.now(), ids };
    if (baseURL.includes("localhost") || baseURL.includes("127.0.0.1")) {
      g.__dotsLlamaCppLocalAvailable = true;
    }
    return ids;
  } catch {
    if (baseURL.includes("localhost") || baseURL.includes("127.0.0.1")) {
      g.__dotsLlamaCppLocalAvailable = false;
    }
    return [];
  }
}

const pick = (ids: string[], prefs: RegExp[]) => prefs.map((re) => ids.find((id) => re.test(llamaCppId(id)))).find(Boolean) ?? ids[0];
export const preferredLlamaCppModel = (ids: string[]) => pick(ids, MAIN_PREFERENCE);
export const smallLlamaCppModel = (ids: string[]) => pick(ids, SMALL_PREFERENCE);

/** Adapts chat.completions stream events to OpenAI Responses API event shape */
async function* adaptChatStream(compStream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>, model: string) {
  const respId = "resp_" + Math.random().toString(36).slice(2);
  const msgId = "msg_" + Math.random().toString(36).slice(2);
  let started = false;
  let rawText = "";
  let inThink = false;
  let buffered = "";
  const toolCalls: { id: string; name: string; arguments: string }[] = [];

  for await (const chunk of compStream) {
    const delta = chunk.choices?.[0]?.delta;
    if (!delta) continue;

    if (delta.content) {
      rawText += delta.content;
      buffered += delta.content;

      while (buffered.length > 0) {
        if (!inThink) {
          const thinkStart = buffered.indexOf("<think>");
          if (thinkStart === -1) {
            const partial = ["<", "<t", "<th", "<thi", "<thin", "<think"].find((p) => buffered.endsWith(p));
            if (partial) {
              const emitPart = buffered.slice(0, -partial.length);
              if (emitPart) {
                if (!started) {
                  started = true;
                  yield { type: "response.output_item.added", item: { id: msgId, type: "message", role: "assistant", content: [] } };
                }
                yield { type: "response.output_text.delta", item_id: msgId, delta: emitPart };
              }
              buffered = partial;
              break;
            }
            if (!started) {
              started = true;
              yield { type: "response.output_item.added", item: { id: msgId, type: "message", role: "assistant", content: [] } };
            }
            yield { type: "response.output_text.delta", item_id: msgId, delta: buffered };
            buffered = "";
          } else {
            const pre = buffered.slice(0, thinkStart);
            if (pre) {
              if (!started) {
                started = true;
                yield { type: "response.output_item.added", item: { id: msgId, type: "message", role: "assistant", content: [] } };
              }
              yield { type: "response.output_text.delta", item_id: msgId, delta: pre };
            }
            buffered = buffered.slice(thinkStart + 7);
            inThink = true;
          }
        } else {
          const thinkEnd = buffered.indexOf("</think>");
          if (thinkEnd === -1) {
            const partialEnd = ["<", "</", "</t", "</th", "</thi", "</thin", "</think"].find((p) => buffered.endsWith(p));
            if (partialEnd) {
              buffered = partialEnd;
            } else {
              buffered = "";
            }
            break;
          } else {
            buffered = buffered.slice(thinkEnd + 8);
            inThink = false;
          }
        }
      }
    }

    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const idx = tc.index ?? 0;
        toolCalls[idx] ??= { id: tc.id || `call_${Math.random().toString(36).slice(2)}`, name: "", arguments: "" };
        if (tc.id) toolCalls[idx].id = tc.id;
        if (tc.function?.name) toolCalls[idx].name += tc.function.name;
        if (tc.function?.arguments) toolCalls[idx].arguments += tc.function.arguments;
      }
    }
  }

  const { cleanText } = stripThinking(rawText);

  if (started && cleanText) {
    yield {
      type: "response.output_item.done",
      item: { id: msgId, type: "message", role: "assistant", content: [{ type: "output_text", text: cleanText }] },
    };
  }

  const output: any[] = [];
  if (cleanText) {
    output.push({ id: msgId, type: "message", role: "assistant", content: [{ type: "output_text", text: cleanText }] });
  }

  for (const tc of toolCalls) {
    if (!tc) continue;
    yield { type: "response.output_item.added", item: { type: "function_call", call_id: tc.id, name: tc.name, arguments: tc.arguments } };
    yield { type: "response.output_item.done", item: { type: "function_call", call_id: tc.id, name: tc.name, arguments: tc.arguments } };
    output.push({ type: "function_call", call_id: tc.id, name: tc.name, arguments: tc.arguments });
  }

  yield {
    type: "response.completed",
    response: {
      id: respId,
      model,
      output,
      output_text: cleanText,
    },
  };
}

/** Fallback to chat completions if /v1/responses is not supported by the endpoint */
async function fallbackResponsesCreate(client: OpenAI, body: any, opts?: any): Promise<any> {
  const model = body.model;
  const instructions = body.instructions;
  const inputList: any[] = Array.isArray(body.input) ? body.input : typeof body.input === "string" ? [{ role: "user", content: body.input }] : [];

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (instructions) {
    messages.push({ role: "system", content: instructions });
  }

  for (let i = 0; i < inputList.length; i++) {
    const item = inputList[i];
    if (typeof item === "string") {
      messages.push({ role: "user", content: item });
    } else if ("type" in item && item.type === "function_call") {
      const tool_calls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [
        {
          id: item.call_id,
          type: "function",
          function: { name: item.name, arguments: item.arguments },
        },
      ];
      while (i + 1 < inputList.length && "type" in inputList[i + 1] && (inputList[i + 1] as any).type === "function_call") {
        i++;
        const next = inputList[i] as any;
        tool_calls.push({
          id: next.call_id,
          type: "function",
          function: { name: next.name, arguments: next.arguments },
        });
      }
      messages.push({ role: "assistant", content: null, tool_calls });
    } else if ("type" in item && item.type === "function_call_output") {
      messages.push({
        role: "tool",
        tool_call_id: item.call_id,
        content: typeof item.output === "string" ? item.output : JSON.stringify(item.output),
      });
    } else if ("role" in item && item.role === "user") {
      if (typeof item.content === "string") {
        messages.push({ role: "user", content: item.content });
      } else if (Array.isArray(item.content)) {
        const parts = item.content.map((p: any) => {
          if (p.type === "input_text") return { type: "text" as const, text: p.text };
          if (p.type === "input_image") return { type: "image_url" as const, image_url: { url: p.image_url } };
          return { type: "text" as const, text: String(p.text || "") };
        });
        messages.push({ role: "user", content: parts as any });
      }
    } else if ("role" in item && item.role === "assistant") {
      messages.push({ role: "assistant", content: typeof item.content === "string" ? item.content : "" });
    }
  }

  const functionTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
  if (Array.isArray(body.tools)) {
    for (const t of body.tools) {
      if (t.type === "function" && t.name) {
        functionTools.push({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters as Record<string, unknown>,
          },
        });
      }
    }
  }

  let response_format: OpenAI.Chat.Completions.ChatCompletionCreateParams["response_format"] | undefined;
  if (body.text?.format?.type === "json_schema" && body.text.format.schema) {
    response_format = {
      type: "json_schema",
      json_schema: {
        name: body.text.format.name || "response",
        strict: body.text.format.strict ?? false,
        schema: body.text.format.schema as Record<string, unknown>,
      },
    };
  }

  if (body.stream) {
    const stream = await client.chat.completions.create(
      {
        model,
        messages,
        tools: functionTools.length ? functionTools : undefined,
        stream: true,
      },
      opts,
    );
    return adaptChatStream(stream, model);
  }

  const comp = await client.chat.completions.create(
    {
      model,
      messages,
      tools: functionTools.length ? functionTools : undefined,
      response_format,
    },
    opts,
  );

  const rawText = comp.choices[0]?.message?.content ?? "";
  const { cleanText } = stripThinking(rawText);
  const output: any[] = [];
  if (cleanText) {
    output.push({
      id: `msg_${Math.random().toString(36).slice(2)}`,
      type: "message",
      role: "assistant",
      content: [{ type: "output_text", text: cleanText }],
    });
  }
  if (comp.choices[0]?.message?.tool_calls) {
    for (const tc of comp.choices[0].message.tool_calls) {
      if ("function" in tc) {
        output.push({
          type: "function_call",
          call_id: tc.id,
          name: tc.function.name,
          arguments: tc.function.arguments,
        });
      }
    }
  }

  return {
    id: comp.id,
    model,
    output,
    output_text: cleanText,
  };
}

export function llamacpp(): OpenAI {
  const baseURL = llamaCppBaseUrl();
  const key = llamaCppKey() || "sk-no-key-required";

  if (!g.__dotsLlamaCpp || g.__dotsLlamaCpp.key !== key || g.__dotsLlamaCpp.url !== baseURL) {
    const client = new OpenAI({ apiKey: key, baseURL });

    // llama.cpp server uses OpenAI-compatible /v1/chat/completions (does not implement /v1/responses)
    client.responses.create = (async (body: any, opts?: any): Promise<any> => {
      try {
        return await fallbackResponsesCreate(client, body, opts);
      } catch (err: any) {
        if (err?.code === "ECONNREFUSED" || /ECONNREFUSED|fetch failed/i.test(err?.message)) {
          const isLocal = baseURL.includes("localhost") || baseURL.includes("127.0.0.1");
          const hint = isLocal
            ? `Could not connect to local llama.cpp server at ${baseURL}. Make sure llama-server is running (e.g. 'llama-server -m <model.gguf> --port 8080'), or configure LLAMACPP_BASE_URL in Settings / .env.`
            : `Could not connect to llama.cpp server at ${baseURL}. Please verify the server is running and check LLAMACPP_BASE_URL / LLAMACPP_API_KEY.`;
          throw new Error(hint);
        }
        throw err;
      }
    }) as any;

    g.__dotsLlamaCpp = { key, url: baseURL, client };
  }

  return g.__dotsLlamaCpp.client;
}

