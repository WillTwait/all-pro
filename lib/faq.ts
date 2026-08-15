export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const PROGRAM_SUMMARY = [
  "Three full-body days each week on non-consecutive days: Heavy (100%), Medium (90%), Light (80%).",
  "Five-week cycle. Week 1 is 8 reps, then 9, 10, 11, and week 5 is 12 reps with the same weights.",
  "Every lift has four sets: two warm-ups (about 1/4 and 1/2 of the work weight) and two work sets.",
  "All-Pro only requires warm-ups on squat, bench, and row. Keep the other warm-ups if they help, skip them if they do not.",
  "Rest about 1:00 between warm-ups and 1:30 between work sets.",
  "Week 5 heavy is the test day. If both work sets hit 12, that lift goes up 10% next cycle. If you miss even one rep, keep the same weight.",
  "Do not add extra lifts until you have finished at least three cycles. Cardio and abs belong on rest days, and keep them modest.",
];

export const SCALING = {
  title: "The formula",
  intro:
    "The heavy working weight is a 10-rep max — about 75% of a one-rep max. Medium, light, and warm-ups are percentages of that. Same formulas as the old spreadsheet, rounded to 5 lb.",
  setRows: [
    {
      name: "Warm-up 1",
      ofTenRm: "25% of that day's work",
      ofOneRm: "19% of 1RM on heavy day",
      formula: "FLOOR(work × 0.25, 5)",
    },
    {
      name: "Warm-up 2",
      ofTenRm: "50% of that day's work",
      ofOneRm: "38% of 1RM on heavy day",
      formula: "FLOOR(work × 0.50, 5)",
    },
    {
      name: "Heavy work",
      ofTenRm: "100% of 10RM",
      ofOneRm: "75% of 1RM",
      formula: "the cycle working weight",
    },
    {
      name: "Medium work",
      ofTenRm: "90% of 10RM",
      ofOneRm: "67.5% of 1RM",
      formula: "MROUND(10RM × 0.90, 5)",
    },
    {
      name: "Light work",
      ofTenRm: "80% of 10RM",
      ofOneRm: "60% of 1RM",
      formula: "MROUND(10RM × 0.80, 5)",
    },
  ],
  weekRows: [
    { week: 1, reps: 8, ofOneRm: "78%", note: "Easy. 10RM for 8 reps." },
    { week: 2, reps: 9, ofOneRm: "76%", note: "Still in reserve." },
    { week: 3, reps: 10, ofOneRm: "75%", note: "True 10RM week." },
    { week: 4, reps: 11, ofOneRm: "72%", note: "Getting hard." },
    { week: 5, reps: 12, ofOneRm: "70%", note: "Test. 12/12 → next 10RM is × 1.10." },
  ],
  nextCycle:
    "Next cycle 10RM = MROUND(current 10RM × 1.10, 5) only if both heavy work sets hit 12 on week 5. Miss a rep and that lift repeats the same 10RM.",
  estimatedMax: "Estimated 1RM = ROUNDDOWN(work weight ÷ week %1RM, 0). Week 1 uses 0.78, week 3 uses 0.75, week 5 uses 0.70.",
  example: "If this cycle's 10RM is 95 lb: Heavy 95, Medium 85, Light 75. Heavy warm-ups FLOOR to 20 and 45. Estimated 1RM on week 1 is ROUNDDOWN(95 / 0.78) = 121.",
};

export const CYCLE_EXPLAINER = {
  title: "Cycle 1 vs Cycle 2",
  body: [
    "A cycle is one five-week block of the same workout. The lifts do not change. Heavy, medium, and light are the three days in a week (100%, 90%, 80%) — not different cycles.",
    "On the old spreadsheet, Cycle 1 and Cycle 2 were the same program. Cycle 2 was just ~10% more on the bar after you passed week 5 with 12 reps.",
    "You are not still on Cycle 2. After time off you start a brand-new Cycle 1 here: week 1, 8 reps. The only choice is which heavy weights to put on that new block.",
  ],
  oldLoads: [
    { label: "Old Cycle 1", note: "where you started then", squat: 95, bench: 95, row: 65, ohp: 55 },
    { label: "Old Cycle 2", note: "where you left off", squat: 105, bench: 105, row: 70, ohp: 60 },
  ],
};

export const FAQ: FaqItem[] = [
  {
    id: "formula",
    question: "What % of max am I supposed to lift?",
    answer:
      "Heavy working weight is a 10-rep max (~75% of 1RM). Medium is 90% of that (~67.5% 1RM). Light is 80% (~60% 1RM). Warm-ups are FLOOR(25%) and FLOOR(50%) of that day's work weight. Weeks only add a rep: 8, 9, 10, 11, 12. Estimated 1RM is ROUNDDOWN(work ÷ 0.78/0.76/0.75/0.72/0.70). Next cycle is × 1.10 if week 5 heavy is 12/12.",
  },
  {
    id: "cycle-vs-cycle",
    question: "What's the difference between Cycle 1 and Cycle 2?",
    answer:
      "Nothing in the workout itself. Cycle 2 is the next 5-week block with more weight after you hit 12/12 on week 5 heavy. Your old sheet: Cycle 1 squat/bench 95, Cycle 2 squat/bench 105. After a long layoff you start a new Cycle 1. Default weights here are old Cycle 1 (~90% of that last peak), not old Cycle 2.",
  },
  {
    id: "sets",
    question: "How many sets am I doing?",
    answer:
      "Two work sets per exercise. This tracker also shows two warm-up sets, matching your old spreadsheet. All-Pro only requires those warm-ups on squat, bench, and bent row. Overhead press, SLDL, curls/upright rows, and calves do not need them, but you can keep them if you want.",
  },
  {
    id: "starting-weight",
    question: "What should I start with after time off?",
    answer:
      "Start a new Cycle 1. Default to old Cycle 1 loads (squat/bench 95). Old Cycle 2 (105) is where you finished years ago, not where you resume. Conservative (squat 65) is there if even 95 feels like too much. You can edit any lift on Setup.",
  },
  {
    id: "too-easy",
    question: "The first weeks feel easy. Should I add weight?",
    answer:
      "No. Weeks 1–3 are supposed to feel manageable. Finish the five-week cycle. Only add weight after week 5 heavy if you hit 12/12 on that lift. If the whole first cycle was truly trivial, you can add a little more than 10% for the next cycle — not mid-cycle.",
  },
  {
    id: "missed-day",
    question: "I missed a day. What now?",
    answer:
      "If you can only train twice in a week, make both days heavy and leave at least two rest days between them. Do not do this often. The program is built around three days. Use Cycle on this app to jump to the session you actually want.",
  },
  {
    id: "test-day",
    question: "When do I increase the weight?",
    answer:
      "Only after week 5 heavy. Both work sets must be 12 reps. Miss even one rep and that lift repeats the same weight for the next five weeks. Add 10% of the full load, including the bar. Example from All-Pro: 45 lb bar + 55 lb plates = 100, next cycle is 110.",
  },
  {
    id: "ohp-miss",
    question: "I only missed one rep on press. Can I still bump it?",
    answer:
      "No. The 12/12 rule is the stall-protection. Repeat the weight on that lift, increase the ones you actually passed.",
  },
  {
    id: "substitutes",
    question: "Can I swap exercises or use dumbbells?",
    answer:
      "Stay with the seven lifts unless something hurts. Curls can be swapped for upright rows — your old sheet used both. Dumbbells are fine as a last resort; a barbell is the intended tool. Machine substitutes (goblet squat, chest-supported row, seated press) are okay while you relearn form, then get back to the bar.",
  },
  {
    id: "extras",
    question: "Can I add pull-ups, tris, laterals, or more curls?",
    answer:
      "Not yet. Bench and press already hit triceps. Extra work is a common reason beginners stall. After three cycles you may add one assistance lift, one set, at the end of the workout, on the same rep scheme. Never add more than one new assistance movement per cycle.",
  },
  {
    id: "deadlifts",
    question: "Why stiff-legged deadlifts instead of regular deadlifts?",
    answer:
      "Squat plus SLDL covers the posterior chain without stacking two very heavy CNS lifts. Conventional deadlifts plus squats on the same program tend to burn beginners out.",
  },
  {
    id: "cardio-abs",
    question: "What about cardio, climbing, spin, and abs?",
    answer:
      "Keep extra work modest. Two easy cardio sessions a week is plenty. Do not do hard spin or a long climb the day before Heavy. Abs are optional; the compound lifts already train your midsection. If you add abs, one weighted set after lifting is enough, 15 reps in week 1 up to 25 in week 5.",
  },
  {
    id: "diet",
    question: "Will I gain muscle on this?",
    answer:
      "Lifting is the stimulus. Muscle still needs a calorie surplus, enough protein, and sleep. Roughly 1.4–1.6 g protein per kg, regular meals, carbs around training, 7–9 hours of sleep. Do not run a harsh cut while restarting.",
  },
  {
    id: "beginner",
    question: "Am I still a beginner?",
    answer:
      "On this routine, beginner means your squat is well under 2× bodyweight and your bench is well under 1.5× bodyweight, not how many years you have a gym membership. If those numbers are still far away, this program is still the right tool.",
  },
];
