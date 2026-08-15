"use client";

import { useRef } from "react";
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

export function LogView() {
  const { store, exportJson, importJson, resetAll, resetCurrentSession } = useWorkoutStore();
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
        <p>Everything stays on this phone in local storage. Export a backup if you care.</p>
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
