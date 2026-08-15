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

export const FAQ: FaqItem[] = [
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
      "Your old Cycle 2 peak was squat 105, bench 105, row 70, press 60, SLDL 85, accessory 40, calves 75. Medium (the default) is old Cycle 1: 95 / 95 / 65 / 55 / 85 / 40 / 70 — about 90% of that peak. Conservative uses the restart-sheet test loads. You can edit any lift on Setup. Do not jump back to Cycle 2 numbers just because they used to move.",
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
      "Only after week 5 heavy. Both work sets must be 12 reps. Miss even one rep and that lift repeats the same weight for the next five weeks. Increases are 10% of the full load, including the bar, then rounded to 5 lb.",
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
