export const INTENSITIES = ["heavy", "medium", "light"] as const;
export type Intensity = (typeof INTENSITIES)[number];

export const WEEKS = [1, 2, 3, 4, 5] as const;
export type Week = (typeof WEEKS)[number];

export const ACCESSORIES = ["curl", "upright-row"] as const;
export type Accessory = (typeof ACCESSORIES)[number];

export const EXERCISE_IDS = [
  "squat",
  "bench",
  "row",
  "ohp",
  "sldl",
  "accessory",
  "calf",
] as const;
export type ExerciseId = (typeof EXERCISE_IDS)[number];

export type WeightPreset = "conservative" | "medium" | "peak";

export type Baselines = Record<ExerciseId, number>;

export type SetKind = "warmup" | "work";

export type PlannedSet = {
  kind: SetKind;
  index: number;
  weight: number;
  reps: number;
};

export type LoggedSet = PlannedSet & {
  actualWeight: number;
  actualReps: number | null;
  done: boolean;
};

export type LoggedExercise = {
  exerciseId: ExerciseId;
  name: string;
  sets: LoggedSet[];
};

export type Session = {
  id: string;
  date: string;
  cycle: number;
  week: Week;
  intensity: Intensity;
  startedAt: string;
  completedAt: string | null;
  notes: string;
  exercises: LoggedExercise[];
};

export type Pointer = {
  cycle: number;
  week: Week;
  intensity: Intensity;
};

export type Store = {
  version: 1;
  setupComplete: boolean;
  accessory: Accessory;
  pointer: Pointer;
  cycles: Record<string, Baselines>;
  sessions: Session[];
};
