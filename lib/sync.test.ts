import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createStore } from "./storage";
import { pickCloudStore, stampStore } from "./sync";

describe("pickCloudStore", () => {
  it("keeps a finished local setup over an empty remote profile", () => {
    const local = stampStore({ ...createStore("medium"), setupComplete: true }, "2026-08-15T12:00:00.000Z");
    const remote = createStore("medium");
    const picked = pickCloudStore(local, remote, "2026-08-15T13:00:00.000Z");
    assert.equal(picked.store, local);
    assert.equal(picked.pushLocal, true);
  });

  it("uses a finished remote setup when this phone is still on the welcome screen", () => {
    const local = createStore("medium");
    const remote = stampStore({ ...createStore("peak"), setupComplete: true }, "2026-08-15T12:00:00.000Z");
    const picked = pickCloudStore(local, remote, "2026-08-15T12:00:00.000Z");
    assert.equal(picked.store, remote);
    assert.equal(picked.pushLocal, false);
  });

  it("uses the newer timestamp when both sides are set up", () => {
    const older = stampStore({ ...createStore("medium"), setupComplete: true }, "2026-08-15T10:00:00.000Z");
    const newer = stampStore({ ...createStore("peak"), setupComplete: true }, "2026-08-15T12:00:00.000Z");
    assert.equal(pickCloudStore(older, newer, "2026-08-15T12:00:00.000Z").store, newer);
    assert.equal(pickCloudStore(newer, older, "2026-08-15T10:00:00.000Z").store, newer);
  });
});
