import type { ExerciseId } from "./types";

export type FormGuide = {
  id: ExerciseId;
  title: string;
  setup: string;
  cues: string[];
  equipment: string;
  avoid: string[];
  video: string;
};

export const FORM_GUIDES: FormGuide[] = [
  {
    id: "squat",
    title: "Squat",
    video: "https://www.youtube.com/watch?v=huVujjfzphI",
    equipment: "Barbell back squat. Goblet squat or leg press if you need a stand-in.",
    setup: "Bar on the upper back, not the neck. Feet about shoulder-width, toes slightly out. Brace before you unrack.",
    cues: [
      "Take a breath and brace like you are about to be punched.",
      "Sit between your hips. Knees track over toes.",
      "Hit a consistent depth you can own — roughly thighs parallel — then drive up without bouncing.",
      "Keep the chest up and the bar path over mid-foot.",
    ],
    avoid: ["Knees caving in", "Heels coming up", "Rounding the lower back", "Cutting depth more each week"],
  },
  {
    id: "bench",
    title: "Bench Press",
    video: "https://www.youtube.com/watch?v=whitHNSryjs",
    equipment: "Barbell bench. Dumbbells or a chest-press machine are fine substitutes.",
    setup: "Eyes under the bar. Shoulder blades pulled down and together. Light arch, feet planted.",
    cues: [
      "Unrack, set the blades, then lower with control to the lower chest / nipple line.",
      "Elbows about 45–70°, not flared to 90°.",
      "Pause a beat on the chest — no bounce — then press up and slightly back.",
      "Wrists stacked over the bar, not bent back.",
    ],
    avoid: ["Bouncing off the chest", "Butt coming off the bench", "Flaring elbows to the ears", "Short range of motion"],
  },
  {
    id: "row",
    title: "Bent Row",
    video: "https://www.youtube.com/watch?v=uaw-Up9Fkcg",
    equipment: "Barbell bent-over row. Chest-supported or machine row if the low back is fried.",
    setup: "Hinge until the torso is near 45° or a bit flatter. Soft knees, neutral spine, bar hanging at mid-shin to knee.",
    cues: [
      "Pull the bar to the lower ribs / upper abs, elbows close.",
      "Squeeze the shoulder blades at the top without shrugging.",
      "Lower under control. The hinge stays locked — this is not a deadlift.",
      "If grip or elbows are cooked from climbing, keep these strict and consider one work set.",
    ],
    avoid: ["Yanking with the lower back", "Standing more upright each rep", "Shrugging the bar up", "Rounding the spine"],
  },
  {
    id: "ohp",
    title: "Overhead Press",
    video: "https://www.youtube.com/watch?v=8d7VpEpm0-4",
    equipment: "Standing barbell press. Seated dumbbell press if the bar feels sketchy.",
    setup: "Bar on the front delts, hands just outside shoulders, elbows slightly in front of the bar. Ribs down, glutes tight.",
    cues: [
      "Press straight up. Move your head back out of the way, then through as the bar passes.",
      "Lock out with biceps by the ears, then lower to the shoulders.",
      "Do not turn it into a push press unless you missed the last reps — and even then, prefer to miss rather than cheat.",
      "These get hard fast. That is normal. Do not add extra triceps work.",
    ],
    avoid: ["Overarching the low back", "Flaring the ribs", "Pressing out in front of the face", "Bouncing out of the bottom"],
  },
  {
    id: "sldl",
    title: "Stiff-Legged Deadlift",
    video: "https://www.youtube.com/watch?v=4UfYR06-A0k",
    equipment: "Barbell SLDL / RDL. Dumbbell RDL is a fine substitute.",
    setup: "Soft knees that stay that way. Bar against the thighs, shoulder blades set, spine long.",
    cues: [
      "Push the hips back. The bar stays close to the legs.",
      "Lower until you feel a strong hamstring stretch with a neutral spine — usually mid-shin, not the floor.",
      "Drive the hips forward to stand up. This is a hinge, not a squat.",
      "Start lighter than your ego wants. The back should stay flat the whole time.",
    ],
    avoid: ["Rounding to chase depth", "Locking the knees completely", "The bar drifting away from the body", "Jerking the lockout"],
  },
  {
    id: "accessory",
    title: "Curl or Upright Row",
    video: "https://www.youtube.com/watch?v=QwJg6nOJ6fM",
    equipment: "Barbell or dumbbell curl, or barbell upright row. Cables are fine.",
    setup: "Pick one accessory and keep it for the whole cycle. Curls were in the original list; your old sheet used upright rows after week 1.",
    cues: [
      "Curl: elbows pinned at your sides, no swing, full squeeze at the top, slow lower.",
      "Upright row: bar stays close, pull to about chest height, elbows higher than the wrists.",
      "If upright rows bother your shoulders, switch to curls. If curls turn into cheat-curls, lower the weight.",
      "These are the last upper-body piece, not the point of the workout.",
    ],
    avoid: ["Swinging the torso on curls", "Pulling upright rows into the neck", "Using a weight you cannot pause"],
  },
  {
    id: "calf",
    title: "Calf Raises",
    video: "https://www.youtube.com/watch?v=ic3hLlPxtFA",
    equipment: "Standing calf raise machine, smith, or barbell. Bodyweight plus a dumbbell works.",
    setup: "Balls of the feet on a step if you have one. Knees soft but not bent like a squat.",
    cues: [
      "Full stretch at the bottom, pause, then rise onto the big toe.",
      "Pause at the top. Do not bounce.",
      "Equal left and right. Hold the rail for balance, not for cheating the load.",
    ],
    avoid: ["Bouncing out of the bottom", "Bending the knees to turn it into a hop", "Cutting the stretch"],
  },
];
