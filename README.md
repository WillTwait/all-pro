# All-Pro

A phone-first tracker for [All Pro's Simple Beginner routine](http://www.workout-calculator.com/2011/04/a-simple-beginners-routine-by-all-pro/). It replaces the old Excel/Google Sheet: three days a week, five-week cycles, four sets per lift (two warm-ups and two work sets).

Logs stay in the browser (`localStorage`). Nothing is sent to a server.

## Using it

1. Open the site on your phone.
2. Pick starting heavy weights. **Medium** is the default — your old Cycle 1 loads, about 90% of where Cycle 2 left off.
3. In Safari: Share → Add to Home Screen.
4. On Today, tap **Start workout** and check off sets as you go.

Cycle lets you jump weeks and days. Guide has form notes and the FAQ from the original spreadsheet.

Week 5 heavy is the test day. Hit 12 reps on both work sets and that lift goes up 10% next cycle.

## Development

```bash
npm install
npm test
npm run dev
```
