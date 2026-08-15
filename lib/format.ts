import type { Intensity, Pointer } from "./types";
import { INTENSITY_LABEL, WEEK_REPS } from "./program";

export function workoutHref(pointer: Pointer): string {
  return `/workout?cycle=${pointer.cycle}&week=${pointer.week}&intensity=${pointer.intensity}`;
}

export function formatPointer(pointer: Pointer): string {
  return `Cycle ${pointer.cycle} · Week ${pointer.week} · ${INTENSITY_LABEL[pointer.intensity]}`;
}

export function sessionTitle(pointer: Pointer): string {
  return `${INTENSITY_LABEL[pointer.intensity]} · ${WEEK_REPS[pointer.week]} reps`;
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function intensityPercent(intensity: Intensity): string {
  if (intensity === "heavy") return "100%";
  if (intensity === "medium") return "90%";
  return "80%";
}
