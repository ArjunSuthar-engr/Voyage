# Voyage

Voyage is a hackathon travel planner for building multi-city trips with stops, activities, budgets, and public share links.

## Judge Demo

Live demo: `https://your-vercel-url.vercel.app`

Demo login:

```txt
Email: demo@voyage.test
Password: voyager@321
```

Judge flow:

1. Open the live demo.
2. Sign in with the demo login above.
3. Click **Create demo trip**.
4. Review the itinerary, stops, activities, and budget.
5. Publish the trip and open the public share link.

## Stack

- Next.js
- Tailwind CSS
- Supabase Auth
- Supabase Postgres

## Local Development

The hosted demo already has Supabase configured. Local development requires your own `.env.local`.

1. Install dependencies:

```powershell
npm.cmd install
```

2. Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. In Supabase SQL Editor, run:

```txt
supabase/schema.sql
```

4. Create a test user in Supabase Authentication, or sign up from the app.

5. Start the app:

```powershell
npm.cmd run dev
```

Open `http://localhost:3000/login`.

## Main Flow

1. Sign in.
2. Create a trip or use **Create demo trip**.
3. Add city stops.
4. Add activities to each stop.
5. Review budget totals.
6. Publish the trip and open the public share link.

## Useful Commands

```powershell
npm.cmd run lint
npm.cmd run build
```
