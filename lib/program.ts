import {
  ACCESSORIES,
  EXERCISE_IDS,
  INTENSITIES,
  type Accessory,
  type Baselines,
  type ExerciseId,
  type Intensity,
  type PlannedSet,
  type Pointer,
  type Session,
  type Week,
  type WeightPreset,
} from "./types";

export { EXERCISE_IDS } from "./types";

export const INTENSITY_LABEL: Record<Intensity, string> = {
  heavy: "Heavy",
  medium: "Medium",
  light: "Light",
};

export const INTENSITY_PERCENT: Record<Intensity, number> = {
  heavy: 1,
  medium: 0.9,
  light: 0.8,
};

export const WEEK_REPS: Record<Week, number> = {
  1: 8,
  2: 9,
  3: 10,
  4: 11,
  5: 12,
};

export const PRESET_LABEL: Record<WeightPreset, string> = {
  conservative: "Light restart (squat 65)",
  medium: "Old Cycle 1 weights (squat 95)",
  peak: "Old Cycle 2 weights (squat 105)",
};

export const PRESET_BLURB: Record<WeightPreset, string> = {
  conservative:
    "From the restart sheet. Use this if the bar feels rusty and you want to relearn the movements first.",
  medium:
    "What you used when you first ran the program. About 90% of where you left off. The right default after time off.",
  peak: "Where the old spreadsheet ended. Same workout, ~10% heavier. Skip this until a new cycle actually earns it.",
};

/** Heavy-day working loads from the original All-Pro spreadsheet. */
export const PRESETS: Record<WeightPreset, Baselines> = {
  conservative: {
    squat: 65,
    bench: 65,
    row: 45,
    ohp: 35,
    sldl: 55,
    accessory: 20,
    calf: 50,
  },
  medium: {
    squat: 95,
    bench: 95,
    row: 65,
    ohp: 55,
    sldl: 85,
    accessory: 40,
    calf: 70,
  },
  peak: {
    squat: 105,
    bench: 105,
    row: 70,
    ohp: 60,
    sldl: 85,
    accessory: 40,
    calf: 75,
  },
};

export const EXERCISE_META: Record<
  ExerciseId,
  { name: string; warmupRequired: boolean; increment: number }
> = {
  squat: { name: "Squat", warmupRequired: true, increment: 5 },
  bench: { name: "Bench Press", warmupRequired: true, increment: 5 },
  row: { name: "Bent Row", warmupRequired: true, increment: 5 },
  ohp: { name: "Overhead Press", warmupRequired: false, increment: 5 },
  sldl: { name: "SLDL", warmupRequired: false, increment: 5 },
  accessory: { name: "Curl", warmupRequired: false, increment: 5 },
  calf: { name: "Calf Raises", warmupRequired: false, increment: 5 },
};

export const ACCESSORY_NAME: Record<Accessory, string> = {
  curl: "Curl",
  "upright-row": "Upright Row",
};

export function isAccessory(value: string): value is Accessory {
  return (ACCESSORIES as readonly string[]).includes(value);
}

export function isIntensity(value: string): value is Intensity {
  return (INTENSITIES as readonly string[]).includes(value);
}

export function isWeek(value: number): value is Week {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export function exerciseName(id: ExerciseId, accessory: Accessory): string {
  if (id === "accessory") return ACCESSORY_NAME[accessory];
  return EXERCISE_META[id].name;
}

export function roundToIncrement(value: number, increment = 5): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value / increment) * increment);
}

/** Excel FLOOR(value, 5) — the sheet uses this for warm-ups. */
export function floorToIncrement(value: number, increment = 5): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value / increment) * increment);
}

export function workWeight(baseline: number, intensity: Intensity): number {
  return roundToIncrement(baseline * INTENSITY_PERCENT[intensity]);
}

export function warmupWeights(work: number): [number, number] {
  return [floorToIncrement(work * 0.25), floorToIncrement(work * 0.5)];
}

export function plannedSets(
  baseline: number,
  intensity: Intensity,
  week: Week,
): PlannedSet[] {
  const work = workWeight(baseline, intensity);
  const reps = WEEK_REPS[week];
  const [wu1, wu2] = warmupWeights(work);
  return [
    { kind: "warmup", index: 1, weight: wu1, reps },
    { kind: "warmup", index: 2, weight: wu2, reps },
    { kind: "work", index: 1, weight: work, reps },
    { kind: "work", index: 2, weight: work, reps },
  ];
}

export function nextPointer(pointer: Pointer): Pointer {
  if (pointer.intensity === "heavy") {
    return { ...pointer, intensity: "medium" };
  }
  if (pointer.intensity === "medium") {
    return { ...pointer, intensity: "light" };
  }
  if (pointer.week < 5) {
    return { cycle: pointer.cycle, week: (pointer.week + 1) as Week, intensity: "heavy" };
  }
  return { cycle: pointer.cycle + 1, week: 1, intensity: "heavy" };
}

export function pointerKey(pointer: Pick<Pointer, "cycle" | "week" | "intensity">): string {
  return `${pointer.cycle}-${pointer.week}-${pointer.intensity}`;
}

export function sessionMatchesPointer(session: Session, pointer: Pointer): boolean {
  return (
    session.cycle === pointer.cycle &&
    session.week === pointer.week &&
    session.intensity === pointer.intensity
  );
}

export function workSetsPassed(session: Session, exerciseId: ExerciseId): boolean {
  const exercise = session.exercises.find((item) => item.exerciseId === exerciseId);
  if (!exercise) return false;
  return exercise.sets
    .filter((set) => set.kind === "work")
    .every((set) => set.done && (set.actualReps ?? 0) >= set.reps);
}

/** Week 5 heavy is the test day: both work sets must hit 12 to add 10% next cycle. */
export function nextCycleBaselines(
  current: Baselines,
  testDay: Session | null,
): { next: Baselines; passed: Record<ExerciseId, boolean> } {
  const passed = {} as Record<ExerciseId, boolean>;
  const next = { ...current };
  for (const id of EXERCISE_IDS) {
    const hit =
      !!testDay &&
      testDay.week === 5 &&
      testDay.intensity === "heavy" &&
      workSetsPassed(testDay, id);
    passed[id] = hit;
    next[id] = hit ? roundToIncrement(current[id] * 1.1) : current[id];
  }
  return { next, passed };
}

/**
 * Sheet Progress tab: estimated 1RM = ROUNDDOWN(work / %1RM, 0).
 * Those %1RM values are the standard NSCA chart (8=78%, 10=75%, 12=70%).
 * Heavy working weight is a 10RM, so it sits at ~75% of 1RM.
 */
export const REPS_TO_1RM_PERCENT: Record<number, number> = {
  8: 0.78,
  9: 0.76,
  10: 0.75,
  11: 0.72,
  12: 0.7,
};

export const TEN_RM_OF_1RM = 0.75;

export function estimated1rm(weight: number, reps: number): number | null {
  const percent = REPS_TO_1RM_PERCENT[reps];
  if (!percent || weight <= 0) return null;
  return Math.floor(weight / percent);
}

export function percentOf1rm(intensity: Intensity, setFraction = 1): number {
  return TEN_RM_OF_1RM * INTENSITY_PERCENT[intensity] * setFraction;
}

export function formatPercent(value: number): string {
  const pct = value * 100;
  const rounded = Math.round(pct * 10) / 10;
  return `${rounded}%`;
}

export function setScaleLabel(
  kind: "warmup" | "work",
  index: number,
  intensity: Intensity,
): string {
  if (kind === "warmup") {
    const fraction = index === 1 ? 0.25 : 0.5;
    return `${Math.round(fraction * 100)}% of today's work · ${formatPercent(percentOf1rm(intensity, fraction))} 1RM`;
  }
  return `${Math.round(INTENSITY_PERCENT[intensity] * 100)}% of 10RM · ${formatPercent(percentOf1rm(intensity))} 1RM`;
}

export function bestWorkSet1rm(session: Session, exerciseId: ExerciseId): number | null {
  const exercise = session.exercises.find((item) => item.exerciseId === exerciseId);
  if (!exercise) return null;
  let best: number | null = null;
  for (const set of exercise.sets) {
    if (set.kind !== "work" || !set.done || set.actualReps == null) continue;
    const estimate = estimated1rm(set.actualWeight, set.actualReps);
    if (estimate != null && (best == null || estimate > best)) best = estimate;
  }
  return best;
}

export function sessionVolume(session: Session): number {
  return session.exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.sets.reduce((sum, set) => {
        if (!set.done || set.actualReps == null) return sum;
        return sum + set.actualWeight * set.actualReps;
      }, 0)
    );
  }, 0);
}

export function defaultBaselines(preset: WeightPreset = "medium"): Baselines {
  return { ...PRESETS[preset] };
}
