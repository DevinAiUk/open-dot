import { isDemoLoginConfigured } from "../../../../server/cloud/demo";
import { getAuth } from "../../../../server/cloud/auth";

export async function POST() {
  if (!isDemoLoginConfigured(process.env)) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const baseURL = process.env.BETTER_AUTH_URL ?? process.env.DOTS_PUBLIC_URL;
  if (!baseURL) return Response.json({ error: "Hosted auth is not configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });

  const response = await getAuth().handler(new Request(new URL("/api/auth/sign-in/email", baseURL), {
    method: "POST",
    headers: { "content-type": "application/json", origin: new URL(baseURL).origin },
    body: JSON.stringify({
      email: process.env.DEMO_EMAIL?.trim().toLowerCase(),
      password: process.env.DEMO_PASSWORD,
      callbackURL: "/cloud",
    }),
  }));
  response.headers.set("Cache-Control", "no-store, private");
  return response;
}
