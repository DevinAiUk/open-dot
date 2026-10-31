import "server-only";
import catalog from "@/data/skills.json";
import * as repo from "./repo";

export type BuiltinSkill = {
  id: string;
  name: string;
  directory: string;
  description: string;
  body: string;
  references: Record<string, string>;
};

export const BUILTIN_SKILLS = catalog as BuiltinSkill[];

/** Find a built-in skill by name (case-insensitive) */
export function getBuiltinSkill(name: string): BuiltinSkill | undefined {
  const q = name.toLowerCase().trim();
  return BUILTIN_SKILLS.find((s) => s.name.toLowerCase() === q || s.id.toLowerCase() === q);
}

/**
 * Resolve a reference file or skill body.
 * Query can be:
 * - "higgsfield-generate" -> skill body
 * - "higgsfield-generate/references/workflows.md" -> reference content
 * - "references/workflows.md" (searches skills for this reference)
 * - "workflows.md" (searches skills for matching reference suffix)
 */
export function resolveSkillContent(query: string): string | null {
  const clean = query.trim().replace(/^['"]|['"]$/g, "");
  // 1. Exact or case-insensitive skill name match
  const skill = getBuiltinSkill(clean);
  if (skill) return skill.body;

  // 2. Check if clean starts with a skill directory/name like "higgsfield-generate/references/..."
  for (const s of BUILTIN_SKILLS) {
    if (clean.toLowerCase().startsWith(s.name.toLowerCase() + "/")) {
      const rel = clean.slice(s.name.length + 1);
      if (s.references[rel]) return s.references[rel];
      const foundKey = Object.keys(s.references).find((k) => k.toLowerCase() === rel.toLowerCase());
      if (foundKey) return s.references[foundKey];
    }
  }

  // 3. Search all skills' references for matching path or suffix
  for (const s of BUILTIN_SKILLS) {
    for (const [key, content] of Object.entries(s.references)) {
      if (
        key.toLowerCase() === clean.toLowerCase() ||
        key.toLowerCase().endsWith("/" + clean.toLowerCase()) ||
        key.toLowerCase() === "references/" + clean.toLowerCase()
      ) {
        return content;
      }
    }
  }

  return null;
}

/**
 * Seed default skills for a dot if not already present.
 */
export function seedDotSkills(dotId: string) {
  const existing = repo.listSkills(dotId);
  const existingNames = new Set(existing.map((s) => s.name.toLowerCase()));
  for (const skill of BUILTIN_SKILLS) {
    if (!existingNames.has(skill.name.toLowerCase())) {
      repo.upsertSkill(dotId, skill.name, skill.description, skill.body);
    }
  }
}

/**
 * Seed default skills for all existing dots.
 */
export function seedAllDotsSkills() {
  const dots = repo.listDots();
  for (const d of dots) {
    seedDotSkills(d.id);
  }
}

