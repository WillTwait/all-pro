"use client";

import Link from "next/link";
import {
  EXERCISE_IDS,
  INTENSITY_LABEL,
  INTENSITY_PERCENT,
  REPS_TO_1RM_PERCENT,
  WEEK_REPS,
  estimated1rm,
  exerciseName,
  formatPercent,
  percentOf1rm,
  plannedSets,
} from "@/lib/program";
import { FormulaTables } from "./formula-tables";
import { workoutHref } from "@/lib/format";
import { baselinesFor } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/store";
import type { Intensity, Week } from "@/lib/types";
import { NumberStepper } from "./number-stepper";

export function CycleView() {
  const { store, setPointer, save, startSession } = useWorkoutStore();
  const { pointer } = store;
  const baselines = baselinesFor(store, pointer.cycle);
  const cycleNumbers = Array.from(
    new Set([
      ...Object.keys(store.cycles).map(Number),
      pointer.cycle,
      pointer.cycle + 1,
    ]),
  ).sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Cycle</h1>
        <p>
          Heavy working weight is this cycle&apos;s 10RM (
          {formatPercent(0.75)} of 1RM). This day is{" "}
          {Math.round(INTENSITY_PERCENT[pointer.intensity] * 100)}% of that (
          {formatPercent(percentOf1rm(pointer.intensity))} of 1RM). Warm-ups are 25% and 50% of
          today&apos;s work, floored to 5 lb.
        </p>
      </header>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Cycle</span>
        <select
          className="h-11 rounded-lg border border-neutral-400 bg-white px-3"
          value={pointer.cycle}
          onChange={(event) =>
            setPointer({ ...pointer, cycle: Number(event.target.value) || 1 })
          }
        >
          {cycleNumbers.map((cycle) => (
            <option key={cycle} value={cycle}>
              Cycle {cycle}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="mb-2 font-medium">Week</legend>
        <div className="grid grid-cols-5 gap-2">
          {([1, 2, 3, 4, 5] as Week[]).map((week) => (
            <button
              key={week}
              type="button"
              className={`h-11 rounded-lg border ${
                pointer.week === week ? "border-black bg-black text-white" : "border-neutral-400"
              }`}
              onClick={() => setPointer({ ...pointer, week })}
            >
              {week}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-neutral-700">{WEEK_REPS[pointer.week]} reps this week</p>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-medium">Day</legend>
        <div className="grid grid-cols-3 gap-2">
          {(["heavy", "medium", "light"] as Intensity[]).map((intensity) => (
            <button
              key={intensity}
              type="button"
              className={`h-11 rounded-lg border ${
                pointer.intensity === intensity
                  ? "border-black bg-black text-white"
                  : "border-neutral-400"
              }`}
              onClick={() => setPointer({ ...pointer, intensity })}
            >
              {INTENSITY_LABEL[intensity]}
            </button>
          ))}
        </div>
      </fieldset>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Heavy baselines this cycle</h2>
        {EXERCISE_IDS.map((id) => (
          <label key={id} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <span>{exerciseName(id, store.accessory)}</span>
            <NumberStepper
              value={baselines[id]}
              step={5}
              onChange={(value) => {
                save({
                  ...store,
                  cycles: {
                    ...store.cycles,
                    [String(pointer.cycle)]: { ...baselines, [id]: value },
                  },
                });
              }}
            />
          </label>
        ))}
      </section>

      <section>
        <h2 className="mb-2 font-medium">Planned sets</h2>
        <p className="mb-2 text-sm text-neutral-700">
          {WEEK_REPS[pointer.week]} reps · estimated 1RM = ROUNDDOWN(work ÷{" "}
          {REPS_TO_1RM_PERCENT[WEEK_REPS[pointer.week]]}) · squat ~
          {estimated1rm(baselines.squat, WEEK_REPS[pointer.week])} lb
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          {EXERCISE_IDS.map((id) => {
            const sets = plannedSets(baselines[id], pointer.intensity, pointer.week);
            return (
              <li key={id}>
                <span className="font-medium">{exerciseName(id, store.accessory)}: </span>
                {sets.map((set) => `${set.weight}×${set.reps}`).join(" · ")}
              </li>
            );
          })}
        </ul>
      </section>

      <Link
        href={workoutHref(pointer)}
        className="flex h-12 items-center justify-center rounded-lg bg-black text-white"
        onClick={() => startSession(pointer)}
      >
        {store.sessions.some(
          (session) =>
            session.cycle === pointer.cycle &&
            session.week === pointer.week &&
            session.intensity === pointer.intensity &&
            session.completedAt,
        )
          ? "Review this session"
          : "Log this session"}
      </Link>

      <p className="text-sm text-neutral-600">
        Week {pointer.week} is {WEEK_REPS[pointer.week]} reps
        {pointer.week === 5 && pointer.intensity === "heavy"
          ? " — test day. Hit 12 on both work sets to add 10% next cycle."
          : "."}
      </p>

      <details className="border-t border-neutral-300 pt-3">
        <summary className="cursor-pointer py-2 font-medium">The formula</summary>
        <div className="pt-2">
          <FormulaTables />
        </div>
      </details>
    </div>
  );
}
