"use client";

import { useState } from "react";
import { useWorkoutStore } from "@/lib/store";

export function PinForm() {
  const { unlock } = useWorkoutStore();
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await unlock(pin);
    } catch {
      setMessage("Wrong code.");
      setPin("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-5 py-4" onSubmit={submit}>
      <header className="flex flex-col gap-2">
        <p className="text-sm text-neutral-600">All-Pro</p>
        <h1 className="text-2xl font-semibold">Enter code</h1>
        <p>One-time unlock on this phone. Logs then sync in the background.</p>
      </header>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Code</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          required
          className="h-12 rounded-lg border border-neutral-400 bg-white px-3 text-center text-2xl tracking-[0.4em]"
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
        />
      </label>

      {message ? <p className="text-sm">{message}</p> : null}

      <button type="submit" disabled={busy || pin.length === 0} className="h-12 rounded-lg bg-black text-white">
        {busy ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}
