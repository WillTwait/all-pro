import { Suspense } from "react";
import { WorkoutLogger } from "@/components/workout-logger";

export default function WorkoutPage() {
  return (
    <Suspense fallback={<p>Loading workout…</p>}>
      <WorkoutLogger />
    </Suspense>
  );
}
