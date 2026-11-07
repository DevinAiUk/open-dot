#!/usr/bin/env node
// CLI utility to list and trigger routines on demand
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const ROOT = process.cwd();
const dbPath = path.join(ROOT, ".data/dots.db");
const db = new DatabaseSync(dbPath);

const routines = db.prepare(`
  SELECT r.id, r.name, r.schedule, r.enabled, r.instruction, d.name as dot_name, r.dot_id
  FROM routines r
  JOIN dots d ON r.dot_id = d.id
  ORDER BY d.name, r.name
`).all();

const target = process.argv[2]?.trim();

if (!target) {
  console.log("=== Registered Routines ===");
  console.log("Usage: node scripts/run-routine.mjs <routine_id_or_name>\n");
  for (const r of routines) {
    console.log(`• [${r.id}] "${r.name}" (${r.dot_name})`);
    console.log(`  Schedule: ${r.schedule} | Enabled: ${r.enabled ? "YES" : "NO"}`);
    console.log(`  Instruction: ${r.instruction.slice(0, 90)}...`);
    console.log();
  }
  process.exit(0);
}

const match = routines.find(
  (r) => r.id.toLowerCase() === target.toLowerCase() || r.name.toLowerCase().includes(target.toLowerCase())
);

if (!match) {
  console.error(`Error: No routine matching "${target}" found.`);
  process.exit(1);
}

console.log(`Found routine: [${match.id}] "${match.name}" for ${match.dot_name}`);
console.log(`Triggering routine via API...`);

try {
  const res = await fetch(`http://localhost:3100/api/routines/${match.id}/run`, { method: "POST" });
  if (res.ok) {
    const data = await res.json();
    console.log("Successfully triggered routine:", data);
  } else {
    console.error(`Failed to trigger routine via server API (${res.status} ${res.statusText}).`);
    console.log("Make sure open-dot dev server is running on port 3100.");
  }
} catch (err) {
  console.error("Could not reach open-dot server at http://localhost:3100:", err.message);
}

