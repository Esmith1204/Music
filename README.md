# Music Rater

A social music rating app: rate albums on a 10-point decimal scale, write short reviews, and follow friends' ratings.

Built with Vite, React, TypeScript, Tailwind CSS v4, React Router, and Supabase.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

The app runs without a backend. Until Supabase is configured, it uses mock data. Posts you create and friends you add are saved in your browser's localStorage.

## Routes

| Path          | View                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| `/`           | Timeline: vertical feed with Everyone / Friends tabs                   |
| `/rate`       | Create a rating: album search with cover art, 0.0–10.0 score, 150-char review |
| `/u/:handle`  | Profile: header stats, Add Friend, ratings grid/list, rating histogram |
| `/profile`    | Redirects to the signed-in user's profile                              |

## Project layout

```
src/
  components/   PostCard, AlbumCover, AlbumSearchField, Avatar, Layout, RatingHistogram, Icons
  pages/        TimelinePage, CreateRatingPage, ProfilePage
  context/      SessionContext: current user (swap in Supabase auth here)
  lib/
    api.ts        Data layer used by every page (currently backed by mock data)
    supabase.ts   Typed Supabase client (null until env vars are set)
    itunes.ts     Album + cover search via the iTunes Search API
    mockData.ts   Seed users and posts
    mockStore.ts  localStorage persistence for the mock layer
    format.ts     Rating validation/formatting, time-ago, image resizing
  types/
    index.ts      App types
    database.ts   Supabase table types (mirror supabase/schema.sql)
supabase/
  schema.sql    Tables, RLS policies, sign-up trigger, cover storage bucket
```

## Hooking up Supabase

1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Replace the mock bodies in `src/lib/api.ts` with Supabase queries. Each function has a matching table, and the TODO at the top of the file lists them. Components don't need changes.
4. In `src/context/SessionContext.tsx`, load the user from `supabase.auth.getSession()` and subscribe to `onAuthStateChange`.
5. Upload covers to the `album-covers` bucket under `<user id>/…` before inserting a post. The form currently produces a data URL for uploads.
