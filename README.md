# All-Pro

A phone-first tracker for [All Pro's Simple Beginner routine](https://forum.bodybuilding.com/showthread.php?t=160947761). It replaces the old Excel/Google Sheet: three days a week, five-week cycles, four sets per lift (two warm-ups and two work sets).

Sign in and logs sync through Supabase. The phone still keeps a local copy so the gym works offline.

## Using it

1. Open the site on your phone.
2. Create an account (or skip and keep logs on this phone only).
3. Pick starting heavy weights. **Medium** is the default — your old Cycle 1 loads.
4. In Safari: Share → Add to Home Screen.
5. On Today, tap **Start workout** and check off sets as you go.

Cycle lets you jump weeks and days. Guide has form notes, videos, and the FAQ.

Week 5 heavy is the test day. Hit 12 reps on both work sets and that lift goes up 10% next cycle, including the bar.

## Environment

Copy `.env.example` to `.env.local`. The publishable key is safe for the browser; row-level security keeps one account from reading another.

In the [Supabase auth settings](https://supabase.com/dashboard/project/looiccguxxyujhhvlltk/auth/url-configuration) add:

- Site URL: the production Vercel URL
- Redirect URLs: `http://localhost:3000/**` and `https://*.vercel.app/**`

For a personal app, turn off **Confirm email** under Authentication → Providers → Email so you can sign in at the gym without hunting for a confirmation message.

On Vercel, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (same values as `.env.example`).

## Development

```bash
npm install
npm test
npm run dev
```
