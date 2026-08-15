"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkoutStore } from "@/lib/store";

export function AuthForm() {
  const { useThisPhoneOnly } = useWorkoutStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setMessage("Check your email to confirm the account, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-5 py-4" onSubmit={submit}>
      <header className="flex flex-col gap-2">
        <p className="text-sm text-neutral-600">All-Pro</p>
        <h1 className="text-2xl font-semibold">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p>
          Logs sync to your account so phone and laptop stay in step. The gym copy still
          caches on this device for offline use.
        </p>
      </header>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          className="h-11 rounded-lg border border-neutral-400 bg-white px-3"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Password</span>
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="h-11 rounded-lg border border-neutral-400 bg-white px-3"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {message ? <p className="text-sm">{message}</p> : null}

      <button type="submit" disabled={busy} className="h-12 rounded-lg bg-black text-white">
        {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>

      <button
        type="button"
        className="h-11 text-sm text-neutral-700"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setMessage(null);
        }}
      >
        {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
      </button>

      <button
        type="button"
        className="h-11 text-sm text-neutral-700"
        onClick={useThisPhoneOnly}
      >
        Skip — keep logs on this phone only
      </button>
    </form>
  );
}
