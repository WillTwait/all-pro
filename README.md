# All-Pro

A phone-first tracker for [All Pro's Simple Beginner routine](https://forum.bodybuilding.com/showthread.php?t=160947761). It replaces the old Excel/Google Sheet: three days a week, five-week cycles, four sets per lift (two warm-ups and two work sets).

Unlock with the code once on a device. Logs sync through Supabase. The phone still keeps a local copy so the gym works offline.

## Using it

1. Open the site on your phone.
2. Enter the code (`11222`).
3. Pick starting heavy weights. **Medium** is the default — your old Cycle 1 loads.
4. In Safari: Share → Add to Home Screen.
5. On Today, tap **Start workout** and check off sets as you go.

Cycle lets you jump weeks and days. Guide has form notes, videos, and the FAQ.

Week 5 heavy is the test day. Hit 12 reps on both work sets and that lift goes up 10% next cycle, including the bar.

## Environment

Copy `.env.example` to `.env.local`. On Vercel set:

- `UNLOCK_CODE=11222`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Development

```bash
npm install
npm test
npm run dev
```
