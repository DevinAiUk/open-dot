# Hosted Open-Dot MVP Architecture

## Decision

Keep the current desktop product as a local Node.js application backed by SQLite. Add a separately scoped hosted account/data slice backed by Better Auth and Neon Postgres; do not silently route desktop state into a shared cloud database.

Use Next.js serverless **Node.js** handlers for hosted auth and data at this stage. The repository currently depends on `node:sqlite`, filesystem access, child processes, process-level singletons, boot-time schedulers, browser automation, and local computer integrations. The installed Next.js 16.3.6 route-segment guide marks the Edge runtime deprecated; its deployment guide lists a Node.js server as the minimum runtime. Moving the full agent/computer stack to an Edge isolate would therefore be an unsupported rewrite, not a safe MVP change.

Use Neon's HTTP-based serverless driver (directly or via Drizzle's Neon HTTP dialect) for database access. That transport is designed for serverless/edge query calls and avoids persistent TCP/WebSocket pools. The database code must remain isolated from desktop SQLite modules so both products can coexist.

## First hosted data slice

- Better Auth owns user identity and sessions; sign-up is disabled by default.
- The hosted Neon schema includes users/sessions, workspaces/memberships, Works Bots, conversations/messages, and workspace-scoped MCP connections.
- Every hosted read/write checks the authenticated user and matching workspace membership in server code; writes additionally require owner/editor role. Client workspace IDs are never trusted alone.
- `/cloud` and `/api/cloud/*` are isolated from desktop-only routes. In hosted mode, the proxy blocks desktop routes and sends users to the hosted surface. Desktop SQLite behavior remains unchanged when `WORKS_AI_HOSTED_MODE` is unset.
- Demo access is opt-in: run the short-lived seed CLI with deployment secrets, then set `DEMO_LOGIN_ENABLED=true` for the web process. Never set `DEMO_SEED_MODE` on the web deployment; it is enabled only inside the CLI process. No fixed public password is shipped.
- Run `pnpm db:migrate` with `DATABASE_URL`, then run `pnpm demo:seed` with the demo user variables. Both require a real Neon database and have not been run in this environment.

## MCP catalog boundary

The hosted UI accepts only endpoints in the admin-provided `WORKS_AI_MCP_SERVERS_JSON` allowlist; arbitrary user URLs are rejected. Catalog URLs must be HTTPS hostnames, without embedded credentials, query parameters, fragments, ports, or literal IP addresses. The UI accepts a bearer token only for an approved server, verifies it by initializing the MCP session and listing tools, then stores it encrypted with AES-256-GCM using the deployment-managed `CLOUD_CREDENTIALS_KEY`. Credentials are scoped by workspace, never returned to the client, and removed on disconnect. Set a 64-character hex encryption key in the host's secret manager and rotate it only with an explicit re-encryption plan. Verification uses an HTTP timeout and rejects redirects. This reduces SSRF exposure but does not replace outbound network egress controls; allowlist endpoints must be operated and reviewed by the deployment owner.

Treat tool descriptions/results from connected MCP servers as untrusted data. Never expose access tokens or execute high-impact tools without separate authorization.

## Deployment and verification limits

A passing local build does not establish Neon connectivity, migrated tables, usable Better Auth login, demo login, MCP connectivity, or production deployment. `DATABASE_URL`, `BETTER_AUTH_SECRET`, deployment base URL, demo seed secrets, `CLOUD_CREDENTIALS_KEY`, and approved MCP server catalog are not configured in the current environment. External setup and a deployed read-back smoke test remain required before calling the hosted MVP live.
