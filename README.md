# CreatorVault

A beginner-friendly creator operating system for organizing affiliate products, samples, batch filming, raw clips, AI clips, scripts, posted videos, and performance notes.

## What is included

- Full Supabase schema with auth-linked tables and row level security policies
- Product Library with search and platform filters
- Script Builder with hook, pain point, voiceover, on-screen text, CTA, hashtags, and status fields
- Hook Bank with search and copy action
- Content Calendar for filming and posting plans
- Performance Tracker for views, likes, comments, clicks, sales, and notes
- Sample app data and Supabase seed data

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add your Supabase keys:

```bash
cp .env.local.example .env.local
```

3. Run `supabase/schema.sql` in your Supabase SQL editor.

4. Optional: update the user ID in `supabase/seed.sql`, then run it in Supabase to add starter data.

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Current next step

The static GitHub test page is still available as `index.html`.

The real app starter now lives in `app/page.tsx`. It includes:

- Creator Command Center
- TikTok product list
- Product-first workspace
- Saved script sets with hook, voiceover, caption, and tags
- Footage upload previews by product
- Free vs Pro limits
- Supabase schema for products, scripts, footage assets, TikTok matches, and performance
- Supabase Storage setup in `supabase/storage.sql`

To run the real Next.js app locally on Windows:

```powershell
cd "C:\Users\erica\Documents\Codex\2026-05-21\build-me-a-beginner-friendly-web"
npm.cmd install
npm.cmd run dev
```

If the old static sandbox is already using port 3000, stop that terminal first or run:

```powershell
npm.cmd run dev -- -p 3001
```

Then open:

```text
http://localhost:3001
```

## Supabase setup for real saved data

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Run `supabase/storage.sql` in the Supabase SQL editor.
4. Copy `.env.local.example` to `.env.local`.
5. Add your Supabase URL and anon key.
6. Restart the Next.js dev server.
