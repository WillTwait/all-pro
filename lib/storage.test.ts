import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSession, createStore } from "./storage";

describe("buildSession", () => {
  it("fills four sets for each lift from Cycle 1 medium defaults", () => {
    const store = createStore("medium");
    const session = buildSession(store, { cycle: 1, week: 1, intensity: "heavy" }, "2026-08-17");
    assert.equal(session.exercises.length, 7);
    const squat = session.exercises[0];
    assert.equal(squat.exerciseId, "squat");
    assert.deepEqual(
      squat.sets.map((set) => set.weight),
      [25, 50, 95, 95],
    );
  });
});
