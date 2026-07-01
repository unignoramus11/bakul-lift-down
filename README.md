# BAKUL LIFT DOWN

Crowd-sourced log for the Bakul Hostel lift at IIIT Hyderabad — is it down right now?

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Database** — create a free Postgres (e.g. [Neon](https://neon.tech), Vercel Postgres, or Supabase), then:

   ```bash
   cp .env.example .env
   ```

   Fill in `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) in `.env`.

3. **Migrate**

   ```bash
   npm run db:migrate
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Deploy (Vercel)

Import the repo, add `DATABASE_URL`, `DIRECT_URL`, and `NEXT_PUBLIC_MAX_IMAGE_KB` (default `20`) as env vars, and deploy. Run `npm run db:migrate` once against the production database.

## Stack

Next.js · Prisma + Postgres · Ark UI · Motion · Tailwind v4. Report images are compressed client-side to under 20 KB (`NEXT_PUBLIC_MAX_IMAGE_KB`) and stored inline. PDF reports are generated entirely in the browser.
