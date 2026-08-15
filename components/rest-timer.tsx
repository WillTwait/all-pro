"use client";

import { useEffect, useState } from "react";

export function restSeconds(kind: "warmup" | "work"): number {
  return kind === "warmup" ? 60 : 90;
}

export function RestTimer({
  kind,
  onSkip,
}: {
  kind: "warmup" | "work";
  onSkip: () => void;
}) {
  const [endsAt] = useState(() => Date.now() + restSeconds(kind) * 1000);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const left = Math.max(0, Math.ceil((endsAt - now) / 1000));
  if (left <= 0) return null;

  const minutes = Math.floor(left / 60);
  const seconds = String(left % 60).padStart(2, "0");

  return (
    <div
      className="sticky top-[env(safe-area-inset-top)] z-10 -mx-4 mb-1 flex items-center justify-between border-b border-neutral-300 bg-white px-4 py-3"
      role="timer"
      aria-live="polite"
      aria-label={`Rest ${minutes}:${seconds}`}
    >
      <p className="text-lg font-semibold">
        Rest {minutes}:{seconds}
      </p>
      <button type="button" className="h-11 min-w-16 rounded-lg border border-neutral-400 px-3" onClick={onSkip}>
        Skip
      </button>
    </div>
  );
}
