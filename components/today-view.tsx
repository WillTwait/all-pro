"use client";

import Link from "next/link";
import { formatPointer, sessionTitle, workoutHref } from "@/lib/format";
import {
  EXERCISE_IDS,
  INTENSITY_PERCENT,
  WEEK_REPS,
  exerciseName,
  workWeight,
} from "@/lib/program";
import { baselinesFor, findSession } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/store";

export function TodayView() {
  const { store, startSession } = useWorkoutStore();
  const current = findSession(store, store.pointer);
  const inProgress = current && !current.completedAt;
  const completed = Boolean(current?.completedAt);
  const baselines = baselinesFor(store, store.pointer.cycle);
  const reps = WEEK_REPS[store.pointer.week];
  const finishedThisCycle = store.sessions.filter(
    (session) => session.cycle === store.pointer.cycle && session.completedAt,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-neutral-600">All-Pro</p>
        <h1 className="text-2xl font-semibold">{formatPointer(store.pointer)}</h1>
        <p>
          {sessionTitle(store.pointer)} · {Math.round(INTENSITY_PERCENT[store.pointer.intensity] * 100)}% of
          10RM
        </p>
      </header>

      <Link
        href={workoutHref(store.pointer)}
        className="flex h-12 items-center justify-center rounded-lg bg-black text-white"
        onClick={() => {
          if (!completed) startSession(store.pointer);
        }}
      >
        {inProgress ? "Continue workout" : completed ? "Review this workout" : "Start workout"}
      </Link>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Today&apos;s work sets</h2>
        <ul className="flex flex-col gap-1">
          {EXERCISE_IDS.map((id) => (
            <li key={id} className="flex justify-between border-b border-neutral-200 py-2">
              <span>{exerciseName(id, store.accessory)}</span>
              <span>
                {workWeight(baselines[id], store.pointer.intensity)} lb × {reps} × 2
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-neutral-700">
        {finishedThisCycle} of 15 sessions this cycle. Rest ~1:00 on warm-ups, ~1:30 on work
        sets.
      </p>
    </div>
  );
}
