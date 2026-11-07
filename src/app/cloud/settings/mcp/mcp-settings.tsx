"use client";

import { useCallback, useEffect, useState } from "react";

type Workspace = { id: string; name: string; role: string };
type Server = { id: string; name: string };
type Connection = { serverId: string; name: string; verifiedAt: string | null; connectedAt: string };
type InitialConnection = Connection & { workspaceId: string };

export default function McpSettings({
  workspaces,
  servers,
  initialConnections,
}: {
  workspaces: Workspace[];
  servers: Server[];
  initialConnections?: InitialConnection[];
}) {
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [serverId, setServerId] = useState(servers[0]?.id ?? "");
  const [credential, setCredential] = useState("");
  const [connections, setConnections] = useState<Connection[]>(() =>
    initialConnections
      ? initialConnections.filter((connection) => connection.workspaceId === (workspaces[0]?.id ?? ""))
      : []
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const loadConnections = useCallback(async (id = workspaceId) => {
    if (!id) { setConnections([]); return; }
    const response = await fetch(`/api/cloud/mcp?workspaceId=${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load this workspace's MCP connections.");
    const data = await response.json() as { connections: Connection[] };
    setConnections(data.connections);
  }, [workspaceId]);

  useEffect(() => {
    let ignore = false;
    if (!workspaceId) return;
    fetch(`/api/cloud/mcp?workspaceId=${encodeURIComponent(workspaceId)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load this workspace's MCP connections.");
        const data = (await response.json()) as { connections: Connection[] };
        if (!ignore) setConnections(data.connections);
      })
      .catch((cause) => {
        if (!ignore) setError(cause instanceof Error ? cause.message : "Could not load connections.");
      });
    return () => {
      ignore = true;
    };
  }, [workspaceId]);

  async function connect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice(""); setBusy(true);
    try {
      const response = await fetch(`/api/cloud/mcp?workspaceId=${encodeURIComponent(workspaceId)}`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ serverId, credential }), cache: "no-store",
      });
      const data = await response.json() as { error?: string; toolCount?: number };
      if (!response.ok) throw new Error(data.error ?? "MCP verification failed.");
      setCredential("");
      setNotice(`Verified connection. ${data.toolCount ?? 0} tools discovered.`);
      await loadConnections();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to connect.");
    } finally { setBusy(false); }
  }

  async function disconnect(id: string) {
    setError(""); setNotice(""); setBusy(true);
    try {
      const response = await fetch(`/api/cloud/mcp?workspaceId=${encodeURIComponent(workspaceId)}&serverId=${encodeURIComponent(id)}`, { method: "DELETE", cache: "no-store" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to remove connection.");
      setNotice("Connection removed.");
      await loadConnections();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to remove connection.");
    } finally { setBusy(false); }
  }

  if (workspaces.length === 0) return <p>No workspace is available for this account.</p>;
  return <div className="flex flex-col gap-6">
    <label className="max-w-md text-sm">Workspace<select className="mt-1 w-full rounded-lg border px-3 py-2" value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)}>{workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name} · {workspace.role}</option>)}</select></label>
    <section className="rounded-xl border p-5">
      <h2 className="text-lg font-semibold">Connect a catalog server</h2>
      {servers.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No approved MCP servers are configured by the deployment administrator.</p> : <form className="mt-4 flex max-w-xl flex-col gap-3" onSubmit={connect}>
        <label className="text-sm">MCP server<select className="mt-1 w-full rounded-lg border px-3 py-2" value={serverId} onChange={(event) => setServerId(event.target.value)}>{servers.map((server) => <option key={server.id} value={server.id}>{server.name}</option>)}</select></label>
        <label className="text-sm">Bearer token<input className="mt-1 w-full rounded-lg border px-3 py-2" type="password" autoComplete="off" value={credential} onChange={(event) => setCredential(event.target.value)} required /></label>
        <p className="text-xs text-muted-foreground">The token is sent only to Works AI for verification, encrypted before database storage, and never displayed again.</p>
        <button className="w-fit rounded-lg bg-foreground px-4 py-2 font-medium text-background disabled:opacity-50" disabled={busy || !workspaceId || !serverId}>{busy ? "Working…" : "Verify and connect"}</button>
      </form>}
    </section>
    <section className="rounded-xl border p-5">
      <h2 className="text-lg font-semibold">Connected servers</h2>
      {connections.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No verified server connections.</p> : <ul className="mt-3 divide-y">{connections.map((connection) => <li key={connection.serverId} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium">{connection.name}</p><p className="text-xs text-muted-foreground">Verified {connection.verifiedAt ? new Date(connection.verifiedAt).toLocaleString() : "—"}</p></div><button className="rounded-md border px-3 py-1 text-sm disabled:opacity-50" disabled={busy || !["owner", "editor"].includes(workspaces.find((workspace) => workspace.id === workspaceId)?.role ?? "")} onClick={() => disconnect(connection.serverId)}>Remove</button></li>)}</ul>}
    </section>
    {notice && <p role="status" className="text-sm text-green-700">{notice}</p>}{error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </div>;
}
