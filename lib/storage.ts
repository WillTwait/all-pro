import { defaultBaselines, exerciseName, plannedSets } from "./program";
import {
  EXERCISE_IDS,
  type Accessory,
  type Baselines,
  type LoggedExercise,
  type Pointer,
  type Session,
  type Store,
} from "./types";

export const STORAGE_KEY = "all-pro-tracker-v1";

export function createStore(preset: "conservative" | "medium" | "peak" = "medium"): Store {
  return {
    version: 1,
    setupComplete: false,
    accessory: "curl",
    pointer: { cycle: 1, week: 1, intensity: "heavy" },
    cycles: { "1": defaultBaselines(preset) },
    sessions: [],
  };
}

export function loadStore(): Store {
  if (typeof window === "undefined") return createStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createStore();
    const parsed = JSON.parse(raw) as Store;
    if (parsed?.version !== 1) return createStore();
    return migrateStore(parsed);
  } catch {
    return createStore();
  }
}

function migrateStore(store: Store): Store {
  const cycles = store.cycles ?? { "1": defaultBaselines("medium") };
  if (!cycles["1"]) cycles["1"] = defaultBaselines("medium");
  return {
    version: 1,
    setupComplete: Boolean(store.setupComplete),
    accessory: store.accessory === "upright-row" ? "upright-row" : "curl",
    pointer: store.pointer ?? { cycle: 1, week: 1, intensity: "heavy" },
    cycles,
    sessions: Array.isArray(store.sessions) ? store.sessions : [],
  };
}

export function saveStore(store: Store): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function exportStore(store: Store): string {
  return JSON.stringify(store, null, 2);
}

export function importStore(raw: string): Store {
  const parsed = JSON.parse(raw) as Store;
  if (parsed?.version !== 1) {
    throw new Error("This backup is not a recognized All-Pro tracker file.");
  }
  return migrateStore(parsed);
}

export function baselinesFor(store: Store, cycle: number): Baselines {
  return store.cycles[String(cycle)] ?? store.cycles["1"] ?? defaultBaselines("medium");
}

export function findSession(store: Store, pointer: Pointer): Session | undefined {
  return store.sessions.find(
    (session) =>
      session.cycle === pointer.cycle &&
      session.week === pointer.week &&
      session.intensity === pointer.intensity,
  );
}

export function buildSession(store: Store, pointer: Pointer, date = todayISO()): Session {
  const baselines = baselinesFor(store, pointer.cycle);
  const exercises: LoggedExercise[] = EXERCISE_IDS.map((id) => ({
    exerciseId: id,
    name: exerciseName(id, store.accessory),
    sets: plannedSets(baselines[id], pointer.intensity, pointer.week).map((set) => ({
      ...set,
      actualWeight: set.weight,
      actualReps: set.reps,
      done: false,
    })),
  }));

  return {
    id: `${pointer.cycle}-${pointer.week}-${pointer.intensity}-${date}`,
    date,
    cycle: pointer.cycle,
    week: pointer.week,
    intensity: pointer.intensity,
    startedAt: new Date().toISOString(),
    completedAt: null,
    notes: "",
    exercises,
  };
}

export function todayISO(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function setCycleBaselines(
  store: Store,
  cycle: number,
  baselines: Baselines,
): Store {
  return {
    ...store,
    cycles: { ...store.cycles, [String(cycle)]: { ...baselines } },
  };
}

export function upsertSession(store: Store, session: Session): Store {
  const existing = store.sessions.findIndex(
    (item) =>
      item.cycle === session.cycle &&
      item.week === session.week &&
      item.intensity === session.intensity,
  );
  const sessions = [...store.sessions];
  if (existing >= 0) sessions[existing] = session;
  else sessions.push(session);
  return { ...store, sessions };
}

export function completeSetup(
  store: Store,
  input: { accessory: Accessory; baselines: Baselines },
): Store {
  return {
    ...store,
    setupComplete: true,
    accessory: input.accessory,
    pointer: { cycle: 1, week: 1, intensity: "heavy" },
    cycles: { "1": { ...input.baselines } },
  };
}
