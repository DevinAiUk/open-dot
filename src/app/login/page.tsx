import { isDemoLoginConfigured } from "../../server/cloud/demo";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
    <div>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Works AI</p>
      <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Access your workspace and Works Bots.</p>
    </div>
    <LoginForm showDemo={isDemoLoginConfigured(process.env)} />
  </main>;
}
