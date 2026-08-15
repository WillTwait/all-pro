"use client";

import { SCALING } from "@/lib/faq";

export function FormulaTables() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{SCALING.title}</h2>
        <p className="mt-1">{SCALING.intro}</p>
      </div>
      <div className="overflow-x-auto text-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="border-b border-neutral-300 py-1 pr-2 font-medium">Set</th>
              <th className="border-b border-neutral-300 py-1 pr-2 font-medium">Of 10RM</th>
              <th className="border-b border-neutral-300 py-1 pr-2 font-medium">Of 1RM</th>
              <th className="border-b border-neutral-300 py-1 font-medium">Sheet formula</th>
            </tr>
          </thead>
          <tbody>
            {SCALING.setRows.map((row) => (
              <tr key={row.name}>
                <td className="py-1 pr-2">{row.name}</td>
                <td className="py-1 pr-2">{row.ofTenRm}</td>
                <td className="py-1 pr-2">{row.ofOneRm}</td>
                <td className="py-1 font-mono text-xs">{row.formula}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto text-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="border-b border-neutral-300 py-1 pr-2 font-medium">Week</th>
              <th className="border-b border-neutral-300 py-1 pr-2 font-medium">Reps</th>
              <th className="border-b border-neutral-300 py-1 pr-2 font-medium">If that were a max set</th>
              <th className="border-b border-neutral-300 py-1 font-medium">What it feels like</th>
            </tr>
          </thead>
          <tbody>
            {SCALING.weekRows.map((row) => (
              <tr key={row.week}>
                <td className="py-1 pr-2">{row.week}</td>
                <td className="py-1 pr-2">{row.reps}</td>
                <td className="py-1 pr-2">{row.ofOneRm} of 1RM</td>
                <td className="py-1">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{SCALING.nextCycle}</p>
      <p>{SCALING.example}</p>
      <p className="text-sm text-neutral-700">{SCALING.estimatedMax}</p>
    </div>
  );
}
