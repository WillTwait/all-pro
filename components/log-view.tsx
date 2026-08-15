"use client";

import { useRef, useState } from "react";
import { formatDate, formatPointer } from "@/lib/format";
import {
  EXERCISE_IDS,
  bestWorkSet1rm,
  exerciseName,
  nextCycleBaselines,
  sessionVolume,
} from "@/lib/program";
import { baselinesFor } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

export function LogView() {
  const {
    store,
    user,
    syncStatus,
    syncError,
    exportJson,
    importJson,
    resetAll,
    resetCurrentSession,
    signOut,
  } = useWorkoutStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const completed = [...store.sessions]
    .filter((session) => session.completedAt)
    .sort((a, b) => b.date.localeCompare(a.date) || b.startedAt.localeCompare(a.startedAt));
  const latestTest = [...store.sessions]
    .filter((session) => session.week === 5 && session.intensity === "heavy" && session.completedAt)
    .sort((a, b) => b.cycle - a.cycle)[0];
  const testResult = latestTest
    ? nextCycleBaselines(baselinesFor(store, latestTest.cycle), latestTest)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Log</h1>
        <p>
          {user
            ? "Workouts sync to your account. This phone also keeps a local copy for the gym."
            : "Logs are on this phone until you sign in. Export a backup if you care."}
        </p>
      </header>

      {testResult && latestTest ? (
        <section className="flex flex-col gap-2">
          <h2 className="font-medium">Cycle {latestTest.cycle} test day</h2>
          <ul>
            {EXERCISE_IDS.map((id) => (
              <li key={id} className="flex justify-between py-1">
                <span>{exerciseName(id, store.accessory)}</span>
                <span>{testResult.passed[id] ? "12/12 · +10%" : "repeat weight"}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Sessions</h2>
        {completed.length === 0 ? (
          <p>Nothing logged yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {completed.map((session) => (
              <li key={session.id} className="border-t border-neutral-200 pt-3">
                <p className="font-medium">
                  {formatDate(session.date)} · {formatPointer(session)}
                </p>
                <p className="text-sm text-neutral-700">
                  Volume {sessionVolume(session).toLocaleString()} lb
                  {EXERCISE_IDS.slice(0, 3).map((id) => {
                    const estimate = bestWorkSet1rm(session, id);
                    return estimate
                      ? ` · ${exerciseName(id, store.accessory)} 1RM ~${estimate}`
                      : "";
                  })}
                </p>
                {session.notes ? <p className="text-sm">{session.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Account</h2>
        {user ? (
          <>
            <p className="text-sm text-neutral-700">{user.email}</p>
            <p className="text-sm text-neutral-700">
              {syncStatus === "saving"
                ? "Saving…"
                : syncStatus === "cloud"
                  ? "Synced"
                  : syncStatus === "offline"
                    ? "Offline. Using the copy on this phone."
                    : syncStatus === "error"
                      ? (syncError ?? "Sync failed.")
                      : "On this phone only."}
            </p>
            <button
              type="button"
              className="h-11 rounded-lg border border-neutral-400"
              onClick={() => {
                void signOut();
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <SignInLater />
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Data</h2>
        <button
          type="button"
          className="h-11 rounded-lg border border-neutral-400"
          onClick={() => {
            const blob = new Blob([exportJson()], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "all-pro-log.json";
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export backup
        </button>
        <button
          type="button"
          className="h-11 rounded-lg border border-neutral-400"
          onClick={() => fileRef.current?.click()}
        >
          Import backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              importJson(await file.text());
            } catch (error) {
              window.alert(error instanceof Error ? error.message : "Could not import that file.");
            }
            event.target.value = "";
          }}
        />
        <button
          type="button"
          className="h-11 rounded-lg border border-neutral-400"
          onClick={() => {
            if (window.confirm("Clear the in-progress session for the selected cycle day?")) {
              resetCurrentSession();
            }
          }}
        >
          Clear current session
        </button>
        <button
          type="button"
          className="h-11 rounded-lg border border-neutral-400"
          onClick={() => {
            if (window.confirm("Erase all local workout data and return to setup?")) {
              resetAll();
            }
          }}
        >
          Reset app
        </button>
      </section>
    </div>
  );
}

function SignInLater() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
        if (!data.session) setMessage("Check your email to confirm the account, then sign in.");
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
    <form className="flex flex-col gap-2" onSubmit={submit}>
      <p className="text-sm text-neutral-700">
        Sign in to keep this log on your account across phones.
      </p>
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="Email"
        className="h-11 rounded-lg border border-neutral-400 bg-white px-3"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        type="password"
        required
        minLength={6}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        placeholder="Password"
        className="h-11 rounded-lg border border-neutral-400 bg-white px-3"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {message ? <p className="text-sm">{message}</p> : null}
      <button type="submit" disabled={busy} className="h-11 rounded-lg bg-black text-white">
        {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>
      <button
        type="button"
        className="h-11 text-sm text-neutral-700"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Need an account?" : "Already have an account?"}
      </button>
    </form>
  );
}
