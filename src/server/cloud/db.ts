import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { cloudSchema } from "./schema";

export function getCloudDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Hosted storage is not configured: DATABASE_URL is missing.");
  return drizzle({ client: neon(connectionString), schema: cloudSchema });
}
