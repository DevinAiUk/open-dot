import { boolean, index, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull();
const updatedAt = () => timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull();

// Better Auth core schema. Keep property names aligned with its logical field names.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("user_email_unique").on(table.email)]);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("session_token_unique").on(table.token), index("session_user_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("account_user_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  createdAt: createdAt(),
});

export const workspaceMembers = pgTable("workspace_members", {
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
  createdAt: createdAt(),
}, (table) => [primaryKey({ columns: [table.workspaceId, table.userId] }), index("workspace_members_user_idx").on(table.userId)]);

export const bots = pgTable("cloud_bots", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  instructions: text("instructions").notNull(),
  createdAt: createdAt(),
}, (table) => [index("cloud_bots_workspace_idx").on(table.workspaceId)]);

export const conversations = pgTable("cloud_conversations", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  botId: text("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: createdAt(),
}, (table) => [index("cloud_conversations_tenant_idx").on(table.workspaceId, table.createdAt)]);

export const messages = pgTable("cloud_messages", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  body: text("body").notNull(),
  createdAt: createdAt(),
}, (table) => [index("cloud_messages_tenant_conversation_idx").on(table.workspaceId, table.conversationId, table.createdAt)]);

export const mcpConnections = pgTable("mcp_connections", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  serverId: text("server_id").notNull(),
  endpoint: text("endpoint").notNull(),
  sealedCredential: text("sealed_credential").notNull(),
  connectedAt: createdAt(),
  verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "date" }),
}, (table) => [uniqueIndex("mcp_connections_workspace_server_unique").on(table.workspaceId, table.serverId)]);

export const cloudSchema = { user, session, account, verification, workspaces, workspaceMembers, bots, conversations, messages, mcpConnections };
