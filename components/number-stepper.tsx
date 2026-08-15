"use client";

type Props = {
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  suffix?: string;
};

export function NumberStepper({ value, step = 1, min = 0, max = 9999, onChange, suffix }: Props) {
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        className="h-10 w-10 rounded-lg border border-neutral-400 text-lg"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - step))}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        className="h-10 w-16 rounded-lg border border-neutral-400 bg-white text-center"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
      />
      {suffix ? <span className="w-8 text-sm text-neutral-600">{suffix}</span> : null}
      <button
        type="button"
        className="h-10 w-10 rounded-lg border border-neutral-400 text-lg"
        aria-label="Increase"
        onClick={() => onChange(Math.min(max, value + step))}
      >
        +
      </button>
    </span>
  );
}
