"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FORM_GUIDES } from "@/lib/form";
import { sessionTitle, workoutHref } from "@/lib/format";
import {
  INTENSITY_LABEL,
  WEEK_REPS,
  exerciseName,
  isIntensity,
  isWeek,
  setScaleLabel,
} from "@/lib/program";
import { findSession } from "@/lib/storage";
import { useWorkoutStore } from "@/lib/store";
import type { Intensity, LoggedSet, Pointer, Session, Week } from "@/lib/types";
import { NumberStepper } from "./number-stepper";

function setLabel(set: LoggedSet): string {
  return set.kind === "warmup" ? `Warm-up ${set.index}` : `Work ${set.index}`;
}

function pointerFromSearch(
  searchParams: URLSearchParams,
  fallback: Pointer,
): Pointer {
  const cycle = Number(searchParams.get("cycle")) || fallback.cycle;
  const weekNumber = Number(searchParams.get("week")) || fallback.week;
  const week: Week = isWeek(weekNumber) ? weekNumber : fallback.week;
  const intensityValue = searchParams.get("intensity") ?? fallback.intensity;
  const intensity: Intensity = isIntensity(intensityValue)
    ? intensityValue
    : fallback.intensity;
  return { cycle, week, intensity };
}

export function WorkoutLogger() {
  const searchParams = useSearchParams();
  const { store, startSession, updateSession, finishSession } = useWorkoutStore();
  const pointer = pointerFromSearch(searchParams, store.pointer);
  const session = findSession(store, pointer);

  if (!session) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{sessionTitle(pointer)}</h1>
        <p>
          Cycle {pointer.cycle}, week {pointer.week}, {INTENSITY_LABEL[pointer.intensity]}.
        </p>
        <button
          type="button"
          className="h-12 rounded-lg bg-black text-white"
          onClick={() => startSession(pointer)}
        >
          Start workout
        </button>
        <Link href="/" className="text-center underline">
          Back
        </Link>
      </div>
    );
  }

  const doneCount = session.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.filter((set) => set.done).length,
    0,
  );
  const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const workDone = session.exercises.every((exercise) =>
    exercise.sets.filter((set) => set.kind === "work").every((set) => set.done),
  );

  function patch(next: Session) {
    updateSession(next);
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-neutral-600">
          Cycle {session.cycle} · Week {session.week} · {INTENSITY_LABEL[session.intensity]}
        </p>
        <h1 className="text-2xl font-semibold">{sessionTitle(session)}</h1>
        <p>
          {doneCount}/{totalSets} sets · rest ~1:00 on warm-ups, ~1:30 on work sets
        </p>
      </header>

      {session.exercises.map((exercise, exerciseIndex) => {
        const guide = FORM_GUIDES.find((item) => item.id === exercise.exerciseId);
        return (
          <section key={exercise.exerciseId} className="border-t border-neutral-300 pt-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">
                {exercise.name || exerciseName(exercise.exerciseId, store.accessory)}
              </h2>
              {guide ? (
                <Link href={`/guide#${guide.id}`} className="text-sm underline">
                  Form
                </Link>
              ) : null}
            </div>
            <ul className="flex flex-col gap-3">
              {exercise.sets.map((set, setIndex) => (
                <li key={`${set.kind}-${set.index}`} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="block font-medium">{setLabel(set)}</span>
                      <span className="block text-sm text-neutral-600">
                        {setScaleLabel(set.kind, set.index, session.intensity)}
                      </span>
                    </span>
                    <label className="flex h-10 items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-5 w-5"
                        checked={set.done}
                        onChange={(event) => {
                          const exercises = session.exercises.map((item, index) => {
                            if (index !== exerciseIndex) return item;
                            const sets = item.sets.map((current, currentIndex) =>
                              currentIndex === setIndex
                                ? { ...current, done: event.target.checked }
                                : current,
                            );
                            return { ...item, sets };
                          });
                          patch({ ...session, exercises });
                        }}
                      />
                      Done
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <NumberStepper
                      value={set.actualWeight}
                      step={5}
                      suffix="lb"
                      onChange={(value) => {
                        const exercises = session.exercises.map((item, index) => {
                          if (index !== exerciseIndex) return item;
                          const sets = item.sets.map((current, currentIndex) =>
                            currentIndex === setIndex
                              ? { ...current, actualWeight: value }
                              : current,
                          );
                          return { ...item, sets };
                        });
                        patch({ ...session, exercises });
                      }}
                    />
                    <NumberStepper
                      value={set.actualReps ?? set.reps}
                      step={1}
                      suffix="r"
                      onChange={(value) => {
                        const exercises = session.exercises.map((item, index) => {
                          if (index !== exerciseIndex) return item;
                          const sets = item.sets.map((current, currentIndex) =>
                            currentIndex === setIndex
                              ? { ...current, actualReps: value }
                              : current,
                          );
                          return { ...item, sets };
                        });
                        patch({ ...session, exercises });
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <label className="flex flex-col gap-1">
        <span className="font-medium">Notes</span>
        <textarea
          className="min-h-20 rounded-lg border border-neutral-400 p-3"
          value={session.notes}
          onChange={(event) => patch({ ...session, notes: event.target.value })}
        />
      </label>

      {session.completedAt ? (
        <div className="flex flex-col gap-3">
          <p className="rounded-lg border border-neutral-400 p-3">
            Saved. Next up is {INTENSITY_LABEL[store.pointer.intensity]}, week {store.pointer.week},{" "}
            {WEEK_REPS[store.pointer.week]} reps.
          </p>
          <Link
            href={workoutHref(store.pointer)}
            className="flex h-12 items-center justify-center rounded-lg bg-black text-white"
          >
            Next workout
          </Link>
        </div>
      ) : (
        <button
          type="button"
          className="h-12 rounded-lg bg-black text-white disabled:bg-neutral-400"
          disabled={!workDone}
          onClick={() => finishSession(session)}
        >
          Finish workout
        </button>
      )}
    </div>
  );
}
