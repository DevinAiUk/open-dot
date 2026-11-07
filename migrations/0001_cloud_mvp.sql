CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS session_user_idx ON "session"(user_id);

CREATE TABLE IF NOT EXISTS "account" (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_user_idx ON "account"(user_id);

CREATE TABLE IF NOT EXISTS "verification" (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz,
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON "verification"(identifier);

CREATE TABLE IF NOT EXISTS workspaces (
  id text PRIMARY KEY,
  name text NOT NULL,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'editor', 'member', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);
CREATE INDEX IF NOT EXISTS workspace_members_user_idx ON workspace_members(user_id);

CREATE TABLE IF NOT EXISTS cloud_bots (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  instructions text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cloud_bots_workspace_idx ON cloud_bots(workspace_id);

CREATE TABLE IF NOT EXISTS cloud_conversations (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  bot_id text NOT NULL REFERENCES cloud_bots(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cloud_conversations_tenant_idx ON cloud_conversations(workspace_id, created_at);

CREATE TABLE IF NOT EXISTS cloud_messages (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  conversation_id text NOT NULL REFERENCES cloud_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cloud_messages_tenant_conversation_idx ON cloud_messages(workspace_id, conversation_id, created_at);

CREATE TABLE IF NOT EXISTS mcp_connections (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  server_id text NOT NULL,
  endpoint text NOT NULL,
  sealed_credential text NOT NULL,
  connected_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  UNIQUE (workspace_id, server_id)
);
