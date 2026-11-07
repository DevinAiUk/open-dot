export type DemoLoginEnvironment = Record<string, string | undefined>;

export function isDemoLoginConfigured(env: DemoLoginEnvironment): boolean {
  return env.DEMO_LOGIN_ENABLED === "true" && Boolean(env.DEMO_EMAIL?.trim()) && Boolean(env.DEMO_PASSWORD);
}
