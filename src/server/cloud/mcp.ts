import { isIP } from "node:net";

export type McpServerDefinition = { id: string; name: string; url: string };

export function parseMcpServerCatalog(raw: string | undefined): McpServerDefinition[] {
  if (!raw) return [];
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(value)) return [];
  const results: McpServerDefinition[] = [];
  const ids = new Set<string>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    if (typeof item.id !== "string" || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(item.id)) return [];
    if (typeof item.name !== "string" || !item.name.trim() || item.name.length > 80) return [];
    if (typeof item.url !== "string" || item.url.length > 2048) return [];
    let url: URL;
    try { url = new URL(item.url); } catch { return []; }
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.port) return [];
    if (isIP(url.hostname) || !url.hostname.includes(".") || /\.(localhost|local|internal)$/i.test(url.hostname)) return [];
    if (ids.has(item.id)) return [];
    ids.add(item.id);
    results.push({ id: item.id, name: item.name.trim(), url: url.toString() });
  }
  return results;
}

export function mcpServerCatalog(): McpServerDefinition[] {
  return parseMcpServerCatalog(process.env.WORKS_AI_MCP_SERVERS_JSON);
}

export async function verifyMcpServer(url: string, accessToken: string): Promise<number> {
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { StreamableHTTPClientTransport } = await import("@modelcontextprotocol/sdk/client/streamableHttp.js");
  const transport = new StreamableHTTPClientTransport(new URL(url), {
    requestInit: { headers: { Authorization: `Bearer ${accessToken}` }, redirect: "error", signal: AbortSignal.timeout(15_000) },
  });
  const client = new Client({ name: "Works AI Hosted", version: "0.1.0" });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    return tools.length;
  } finally {
    await client.close().catch(() => {});
    await transport.close().catch(() => {});
  }
}
