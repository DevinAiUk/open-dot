// Builds src/data/skills.json from src/data/skills: the bundled skills catalog
import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const BASE = path.join(ROOT, "src/data/skills");
const OUT = path.join(ROOT, "src/data/skills.json");

function collectReferences(dir, relPath = "") {
  const refs = {};
  if (!fs.existsSync(dir)) return refs;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const subRel = relPath ? `${relPath}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      Object.assign(refs, collectReferences(full, subRel));
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".yaml") || entry.name.endsWith(".json"))) {
      refs[subRel] = fs.readFileSync(full, "utf8");
    }
  }
  return refs;
}

const skills = [];
const skillDirs = fs.readdirSync(BASE).filter((d) => fs.existsSync(path.join(BASE, d, "SKILL.md")));

for (const dirName of skillDirs) {
  const skillFile = path.join(BASE, dirName, "SKILL.md");
  const raw = fs.readFileSync(skillFile, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) continue;
  const fm = m[1];
  const body = m[2].trim();
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : dirName;
  const descMatch = fm.match(/^description:\s*\|?\n([\s\S]*?)(?=\n[a-z0-9_-]+:|$)/m);
  const desc = descMatch ? descMatch[1].trim().replace(/\s+/g, " ") : "";
  const refs = collectReferences(path.join(BASE, dirName, "references"), "references");
  skills.push({
    id: name,
    name,
    directory: dirName,
    description: desc,
    body,
    references: refs,
  });
}

fs.writeFileSync(OUT, JSON.stringify(skills, null, 2), "utf8");
console.log(`Wrote ${skills.length} skills to ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);

