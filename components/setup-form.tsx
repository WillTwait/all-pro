"use client";

import { useMemo, useState } from "react";
import {
  ACCESSORY_NAME,
  EXERCISE_META,
  PRESET_BLURB,
  PRESET_LABEL,
  PRESETS,
} from "@/lib/program";
import { useWorkoutStore } from "@/lib/store";
import { EXERCISE_IDS, type Accessory, type Baselines, type ExerciseId, type WeightPreset } from "@/lib/types";
import { NumberStepper } from "./number-stepper";

export function SetupForm() {
  const { setup } = useWorkoutStore();
  const [preset, setPreset] = useState<WeightPreset>("medium");
  const [accessory, setAccessory] = useState<Accessory>("curl");
  const [baselines, setBaselines] = useState<Baselines>(PRESETS.medium);

  const labels = useMemo(
    () =>
      EXERCISE_IDS.map((id) => ({
        id,
        name: id === "accessory" ? ACCESSORY_NAME[accessory] : EXERCISE_META[id].name,
      })),
    [accessory],
  );

  function applyPreset(next: WeightPreset) {
    setPreset(next);
    setBaselines({ ...PRESETS[next] });
  }

  function update(id: ExerciseId, value: number) {
    setBaselines((current) => ({ ...current, [id]: value }));
  }

  return (
    <form
      className="flex flex-col gap-6 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        setup({ accessory, baselines });
      }}
    >
      <header className="flex flex-col gap-2">
        <p className="text-sm text-neutral-600">All-Pro</p>
        <h1 className="text-2xl font-semibold">Starting weights</h1>
        <p>
          Three days a week, four sets each lift: two warm-ups and two work sets. Pick a
          starting heavy load. Medium and light days are 90% and 80% of that.
        </p>
      </header>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-medium">Starting point</legend>
        {(Object.keys(PRESETS) as WeightPreset[]).map((key) => (
          <label key={key} className="flex items-start gap-2">
            <input
              type="radio"
              name="preset"
              className="mt-1"
              checked={preset === key}
              onChange={() => applyPreset(key)}
            />
            <span>
              <span className="block font-medium">{PRESET_LABEL[key]}</span>
              <span className="block text-sm text-neutral-700">{PRESET_BLURB[key]}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Accessory lift</span>
        <select
          className="h-11 rounded-lg border border-neutral-400 bg-white px-3"
          value={accessory}
          onChange={(event) => setAccessory(event.target.value as Accessory)}
        >
          <option value="curl">Curl</option>
          <option value="upright-row">Upright row</option>
        </select>
        <span className="text-sm text-neutral-600">
          Original All-Pro uses curls. Your old sheet switched to upright rows after week 1.
        </span>
      </label>

      <div className="flex flex-col gap-3">
        <h2 className="font-medium">Heavy working weights (lb)</h2>
        {labels.map((item) => (
          <label key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <span>{item.name}</span>
            <NumberStepper
              value={baselines[item.id]}
              step={5}
              min={0}
              onChange={(value) => update(item.id, value)}
            />
          </label>
        ))}
      </div>

      <button type="submit" className="h-12 rounded-lg bg-black text-white">
        Start Cycle 1
      </button>
    </form>
  );
}
