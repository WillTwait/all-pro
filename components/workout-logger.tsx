"use client";

import Link from "next/link";
import { useRef, useState } from "react";
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
import type { Accessory, ExerciseId, Intensity, LoggedSet, Pointer, Session, Week } from "@/lib/types";
import { NumberStepper } from "./number-stepper";
import { RestTimer } from "./rest-timer";

function setLabel(set: LoggedSet): string {
  return set.kind === "warmup" ? `Warm-up ${set.index}` : `Work ${set.index}`;
}

function pointerFromSearch(searchParams: URLSearchParams, fallback: Pointer): Pointer {
  const cycle = Number(searchParams.get("cycle")) || fallback.cycle;
  const weekNumber = Number(searchParams.get("week")) || fallback.week;
  const week: Week = isWeek(weekNumber) ? weekNumber : fallback.week;
  const intensityValue = searchParams.get("intensity") ?? fallback.intensity;
  const intensity: Intensity = isIntensity(intensityValue) ? intensityValue : fallback.intensity;
  return { cycle, week, intensity };
}

function currentTarget(session: Session): { exerciseIndex: number; setIndex: number } | null {
  for (let exerciseIndex = 0; exerciseIndex < session.exercises.length; exerciseIndex += 1) {
    const sets = session.exercises[exerciseIndex].sets;
    for (let setIndex = 0; setIndex < sets.length; setIndex += 1) {
      if (!sets[setIndex].done) return { exerciseIndex, setIndex };
    }
  }
  return null;
}

function patchSet(
  session: Session,
  exerciseIndex: number,
  setIndex: number,
  update: Partial<LoggedSet>,
): Session {
  const exercises = session.exercises.map((item, index) => {
    if (index !== exerciseIndex) return item;
    const sets = item.sets.map((current, currentIndex) =>
      currentIndex === setIndex ? { ...current, ...update } : current,
    );
    return { ...item, sets };
  });
  return { ...session, exercises };
}

function workSetsDone(session: Session): boolean {
  return session.exercises.every((exercise) =>
    exercise.sets.filter((set) => set.kind === "work").every((set) => set.done),
  );
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

  return (
    <ActiveWorkout
      session={session}
      accessory={store.accessory}
      pointer={store.pointer}
      updateSession={updateSession}
      finishSession={finishSession}
    />
  );
}

function ActiveWorkout({
  session,
  accessory,
  pointer,
  updateSession,
  finishSession,
}: {
  session: Session;
  accessory: Accessory;
  pointer: Pointer;
  updateSession: (session: Session) => void;
  finishSession: (session: Session) => void;
}) {
  const [peekId, setPeekId] = useState<ExerciseId | null>(null);
  const [rest, setRest] = useState<{ id: number; kind: "warmup" | "work" } | null>(null);
  const restId = useRef(0);

  const target = currentTarget(session);
  const currentExerciseId = target ? session.exercises[target.exerciseIndex]?.exerciseId : null;
  const openId = peekId ?? currentExerciseId ?? session.exercises[0]?.exerciseId ?? null;
  const doneCount = session.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.filter((set) => set.done).length,
    0,
  );
  const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const workDone = workSetsDone(session);

  function markSet(exerciseIndex: number, setIndex: number, done: boolean) {
    const set = session.exercises[exerciseIndex]?.sets[setIndex];
    if (!set) return;
    const next = patchSet(session, exerciseIndex, setIndex, { done });
    updateSession(next);
    setPeekId(null);
    if (!done || workSetsDone(next)) {
      setRest(null);
      return;
    }
    setRest({ id: (restId.current += 1), kind: set.kind });
    try {
      navigator.vibrate?.(15);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      {rest ? (
        <RestTimer key={rest.id} kind={rest.kind} onSkip={() => setRest(null)} />
      ) : null}

      <header className="flex flex-col gap-1">
        <p className="text-sm text-neutral-600">
          Cycle {session.cycle} · Week {session.week} · {INTENSITY_LABEL[session.intensity]}
        </p>
        <h1 className="text-2xl font-semibold">{sessionTitle(session)}</h1>
        <p className="text-sm text-neutral-700">
          {doneCount}/{totalSets} sets
        </p>
      </header>

      {session.exercises.map((exercise, exerciseIndex) => {
        const guide = FORM_GUIDES.find((item) => item.id === exercise.exerciseId);
        const finished = exercise.sets.filter((set) => set.done).length;
        const open = Boolean(session.completedAt) || openId === exercise.exerciseId;
        const title = exercise.name || exerciseName(exercise.exerciseId, accessory);

        return (
          <section key={exercise.exerciseId} className="border-t border-neutral-300 pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex min-h-11 flex-1 items-center justify-between text-left"
                onClick={() =>
                  setPeekId(open && peekId === exercise.exerciseId ? null : exercise.exerciseId)
                }
                aria-expanded={open}
              >
                <span className="text-lg font-semibold">{title}</span>
                <span className="text-sm text-neutral-600">
                  {finished}/{exercise.sets.length}
                </span>
              </button>
              {guide ? (
                <Link href={`/guide#${guide.id}`} className="min-h-11 px-2 py-2 text-sm underline">
                  Form
                </Link>
              ) : null}
            </div>

            {open ? (
              <ul className="mt-2 flex flex-col gap-2">
                {exercise.sets.map((set, setIndex) => {
                  const active =
                    target?.exerciseIndex === exerciseIndex && target.setIndex === setIndex;
                  const reps = set.actualReps ?? set.reps;
                  if (!active && set.done) {
                    return (
                      <li key={`${set.kind}-${set.index}`}>
                        <button
                          type="button"
                          className="flex min-h-11 w-full items-center justify-between text-left text-neutral-600"
                          onClick={() => markSet(exerciseIndex, setIndex, false)}
                        >
                          <span>
                            ✓ {setLabel(set)} · {set.actualWeight} × {reps}
                          </span>
                          <span className="text-sm">Undo</span>
                        </button>
                      </li>
                    );
                  }
                  if (!active) {
                    return (
                      <li
                        key={`${set.kind}-${set.index}`}
                        className="flex min-h-11 items-center justify-between text-neutral-700"
                      >
                        <span>
                          {setLabel(set)} · {set.actualWeight} × {reps}
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li
                      key={`${set.kind}-${set.index}`}
                      className="flex flex-col gap-3 rounded-lg border border-black p-3"
                    >
                      <div>
                        <p className="font-medium">{setLabel(set)}</p>
                        <p className="text-sm text-neutral-600">
                          {setScaleLabel(set.kind, set.index, session.intensity)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <NumberStepper
                          value={set.actualWeight}
                          step={5}
                          suffix="lb"
                          onChange={(value) => {
                            updateSession(
                              patchSet(session, exerciseIndex, setIndex, { actualWeight: value }),
                            );
                          }}
                        />
                        <NumberStepper
                          value={reps}
                          step={1}
                          suffix="r"
                          onChange={(value) => {
                            updateSession(
                              patchSet(session, exerciseIndex, setIndex, { actualReps: value }),
                            );
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="h-14 rounded-lg bg-black text-white"
                        onClick={() => markSet(exerciseIndex, setIndex, true)}
                      >
                        Mark done
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        );
      })}

      <details className="border-t border-neutral-300 pt-3">
        <summary className="cursor-pointer py-2 font-medium">Notes</summary>
        <textarea
          className="mt-2 min-h-20 w-full rounded-lg border border-neutral-400 p-3"
          value={session.notes}
          onChange={(event) => updateSession({ ...session, notes: event.target.value })}
        />
      </details>

      {session.completedAt ? (
        <div className="flex flex-col gap-3">
          <p className="rounded-lg border border-neutral-400 p-3">
            Saved. Next up is {INTENSITY_LABEL[pointer.intensity]}, week {pointer.week},{" "}
            {WEEK_REPS[pointer.week]} reps.
          </p>
          <Link
            href={workoutHref(pointer)}
            className="flex h-12 items-center justify-center rounded-lg bg-black text-white"
          >
            Next workout
          </Link>
        </div>
      ) : workDone ? (
        <div className="fixed inset-x-0 bottom-[calc(3rem+env(safe-area-inset-bottom))] z-10 mx-auto max-w-md px-4">
          <button
            type="button"
            className="h-14 w-full rounded-lg bg-black text-white"
            onClick={() => finishSession(session)}
          >
            Finish workout
          </button>
        </div>
      ) : null}
    </div>
  );
}
