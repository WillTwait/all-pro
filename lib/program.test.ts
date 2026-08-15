import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  estimated1rm,
  floorToIncrement,
  nextCycleBaselines,
  nextPointer,
  plannedSets,
  roundToIncrement,
  workSetsPassed,
  workWeight,
} from "./program";
import type { Session } from "./types";

describe("roundToIncrement", () => {
  it("rounds work weights the way the old sheet did", () => {
    assert.equal(roundToIncrement(85.5), 85);
    assert.equal(roundToIncrement(94.5), 95);
    assert.equal(roundToIncrement(76.5), 75);
    assert.equal(roundToIncrement(76), 75);
  });
});

describe("workWeight", () => {
  it("uses Cycle 1 squat percentages", () => {
    assert.equal(workWeight(95, "heavy"), 95);
    assert.equal(workWeight(95, "medium"), 85);
    assert.equal(workWeight(95, "light"), 75);
  });

  it("uses Cycle 2 squat percentages", () => {
    assert.equal(workWeight(105, "heavy"), 105);
    assert.equal(workWeight(105, "medium"), 95);
    assert.equal(workWeight(105, "light"), 85);
  });
});

describe("plannedSets", () => {
  it("builds two warm-ups and two work sets using the sheet formulas", () => {
    const sets = plannedSets(95, "heavy", 1);
    assert.equal(sets.length, 4);
    assert.deepEqual(
      sets.map((set) => [set.kind, set.weight, set.reps]),
      [
        ["warmup", 20, 8],
        ["warmup", 45, 8],
        ["work", 95, 8],
        ["work", 95, 8],
      ],
    );
  });

  it("adds a rep each week", () => {
    assert.equal(plannedSets(95, "heavy", 5)[2].reps, 12);
  });
});

describe("nextPointer", () => {
  it("walks heavy → medium → light → next week", () => {
    const afterHeavy = nextPointer({ cycle: 1, week: 1, intensity: "heavy" });
    assert.deepEqual(afterHeavy, { cycle: 1, week: 1, intensity: "medium" });
    const afterLight = nextPointer({ cycle: 1, week: 1, intensity: "light" });
    assert.deepEqual(afterLight, { cycle: 1, week: 2, intensity: "heavy" });
    const afterCycle = nextPointer({ cycle: 1, week: 5, intensity: "light" });
    assert.deepEqual(afterCycle, { cycle: 2, week: 1, intensity: "heavy" });
  });
});

function sessionWithReps(reps: number, done = true): Session {
  return {
    id: "test",
    date: "2026-08-17",
    cycle: 1,
    week: 5,
    intensity: "heavy",
    startedAt: "2026-08-17T00:00:00.000Z",
    completedAt: "2026-08-17T01:00:00.000Z",
    notes: "",
    exercises: [
      {
        exerciseId: "squat",
        name: "Squat",
        sets: [
          { kind: "warmup", index: 1, weight: 20, reps: 12, actualWeight: 20, actualReps: 12, done },
          { kind: "warmup", index: 2, weight: 45, reps: 12, actualWeight: 45, actualReps: 12, done },
          { kind: "work", index: 1, weight: 95, reps: 12, actualWeight: 95, actualReps: reps, done },
          { kind: "work", index: 2, weight: 95, reps: 12, actualWeight: 95, actualReps: reps, done },
        ],
      },
    ],
  };
}

describe("week 5 test day", () => {
  it("passes only when both work sets hit 12", () => {
    assert.equal(workSetsPassed(sessionWithReps(12), "squat"), true);
    assert.equal(workSetsPassed(sessionWithReps(11), "squat"), false);
  });

  it("adds 10% only to lifts that passed", () => {
    const current = {
      squat: 95,
      bench: 95,
      row: 65,
      ohp: 55,
      sldl: 85,
      accessory: 40,
      calf: 70,
    };
    const { next, passed } = nextCycleBaselines(current, sessionWithReps(12));
    assert.equal(passed.squat, true);
    assert.equal(next.squat, 105);
    assert.equal(passed.bench, false);
    assert.equal(next.bench, 95);
  });
});

describe("sheet 1RM", () => {
  it("matches Progress tab ROUNDDOWN(weight / 0.78) for week 1", () => {
    assert.equal(estimated1rm(95, 8), 121);
    assert.equal(estimated1rm(105, 8), 134);
  });
});

describe("warmup floor", () => {
  it("uses FLOOR to 5 lb like the spreadsheet", () => {
    assert.equal(floorToIncrement(23.75), 20);
    assert.equal(floorToIncrement(47.5), 45);
    assert.equal(floorToIncrement(26.25), 25);
    assert.equal(floorToIncrement(52.5), 50);
  });
});
