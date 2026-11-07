import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Set DATABASE_URL before running the hosted migration.");

const sql = neon(databaseUrl);
const migrationPath = fileURLToPath(new URL("../migrations/0001_cloud_mvp.sql", import.meta.url));
const source = await readFile(migrationPath, "utf8");
const statements = source.split(/;\s*(?:\r?\n|$)/).map((statement) => statement.trim()).filter(Boolean);

for (const [index, statement] of statements.entries()) {
  await sql.query(statement);
  console.log(`Applied statement ${index + 1}/${statements.length}`);
}
console.log(`Cloud schema migration completed (${statements.length} idempotent statements).`);
