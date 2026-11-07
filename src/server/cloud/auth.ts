import "server-only";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { getCloudDb } from "./db";
import { account, session, user, verification } from "./schema";

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Hosted authentication is not configured: BETTER_AUTH_SECRET must be at least 32 characters.");
  const baseURL = process.env.BETTER_AUTH_URL ?? process.env.DOTS_PUBLIC_URL;
  if (!baseURL) throw new Error("Hosted authentication is not configured: set BETTER_AUTH_URL.");

  return betterAuth({
    appName: "Works AI",
    baseURL,
    secret,
    database: drizzleAdapter(getCloudDb(), {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: process.env.DEMO_SEED_MODE !== "true",
    },
    plugins: [nextCookies()],
    advanced: {
      database: { validateSchema: true },
    },
  });
}

type AuthInstance = ReturnType<typeof createAuth>;
let instance: AuthInstance | undefined;

export function getAuth(): AuthInstance {
  instance ??= createAuth();
  return instance;
}
