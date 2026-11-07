import * as repo from "@/server/repo";
import * as runtime from "@/server/agent/runtime";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const routine = repo.getRoutine(id);
  if (!routine) {
    return Response.json({ error: "Routine not found" }, { status: 404 });
  }
  runtime.runRoutine({ ...routine, enabled: true });
  return Response.json({ ok: true, id: routine.id, name: routine.name, dotId: routine.dotId });
}

