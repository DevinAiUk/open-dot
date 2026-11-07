export type HostedPathClass = "public" | "protected" | "blocked" | "asset";

const publicPrefixes = ["/login", "/api/auth", "/api/demo/login"];
const protectedPrefixes = ["/cloud", "/api/cloud"];

export function classifyHostedPath(pathname: string): HostedPathClass {
  if (publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return "public";
  if (protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return "protected";
  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml" || /\.[a-zA-Z0-9]{1,8}$/.test(pathname)) return "asset";
  return "blocked";
}
