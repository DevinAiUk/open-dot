"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm({ showDemo }: { showDemo: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, callbackURL: "/cloud" }),
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Sign-in failed. Check your email and password.");
      router.replace("/cloud");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
      setBusy(false);
    }
  }

  async function signInToDemo() {
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/demo/login", { method: "POST", cache: "no-store" });
      if (!response.ok) throw new Error("Demo login is unavailable.");
      router.replace("/cloud");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to open the demo.");
      setBusy(false);
    }
  }

  return <div className="flex flex-col gap-5">
    <form onSubmit={signIn} className="flex flex-col gap-3">
      <label className="text-sm">Email<input className="mt-1 w-full rounded-lg border px-3 py-2" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="text-sm">Password<input className="mt-1 w-full rounded-lg border px-3 py-2" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button className="rounded-lg bg-foreground px-4 py-2 font-medium text-background disabled:opacity-50" disabled={busy}>Sign in</button>
    </form>
    {showDemo && <button className="rounded-lg border px-4 py-2 font-medium disabled:opacity-50" disabled={busy} onClick={signInToDemo}>Try the demo</button>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </div>;
}
