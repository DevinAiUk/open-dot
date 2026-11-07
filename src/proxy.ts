import { NextResponse, type NextRequest } from "next/server";
import { getAuth } from "./server/cloud/auth";
import { classifyHostedPath } from "./server/cloud/routing";

export async function proxy(request: NextRequest) {
  if (process.env.WORKS_AI_HOSTED_MODE !== "true") return NextResponse.next();

  const pathClass = classifyHostedPath(request.nextUrl.pathname);
  if (pathClass === "asset" || pathClass === "public") return NextResponse.next();
  if (pathClass === "blocked") return NextResponse.redirect(new URL("/cloud", request.url));

  const session = await getAuth().api.getSession({ headers: request.headers });
  if (session) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
