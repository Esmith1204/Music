# Music Rater

A social music rating app: rate albums on a 10-point decimal scale, write short reviews, and follow friends' ratings.

Built with Vite, React, TypeScript, Tailwind CSS v4, React Router, and Supabase.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

The timeline and profiles run on mock data. The rating page (`/rate`) saves to Supabase, so it needs the setup below. Until that's done, submitting shows a "Supabase isn't connected" error.

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
    api.ts        Data layer used by every page (saveRating → Supabase; the rest is mock data)
    supabase.ts   Typed Supabase client (null until env vars are set)
    itunes.ts     Album + cover search via the iTunes Search API
    mockData.ts   Seed users and posts
    mockStore.ts  localStorage persistence for the mock layer
    format.ts     Rating validation/formatting, time-ago, image resizing
  types/
    index.ts      App types
    database.ts   Supabase table types (mirror the SQL files)
supabase/
  ratings.sql   The `ratings` table the rating page writes to (run this now)
  schema.sql    Planned full schema with auth, profiles, and friendships (later)
```

## Connecting Supabase (rating page)

1. Create a project at [supabase.com](https://supabase.com/dashboard), then wait for it to finish provisioning.
2. Open **SQL Editor → New query**, paste all of `supabase/ratings.sql`, and click **Run**. You should see "Success. No rows returned".
3. Click **Connect** at the top of the dashboard (or go to **Project Settings → API Keys**). Copy the **Project URL** and the **publishable key**. The legacy **anon** key works too. Never use the `service_role` or secret key here.
4. Copy `.env.example` to `.env.local` in the project root and fill it in:
   ```
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   `.env.local` is gitignored, so each teammate creates their own. (`VITE_SUPABASE_ANON_KEY` is also accepted for a legacy anon key.)
5. Restart `npm run dev`. Vite only reads env files at startup.
   **On Vercel:** add the same two variables under **Project → Settings → Environment Variables**, then **redeploy**. Vite bakes them into the build, so changing them has no effect until the next deployment.
6. Rate an album at `/rate`, then check **Table Editor → ratings** for the new row.

Until accounts exist, every rating is saved with a dummy `user_id` (`DUMMY_USER_ID` in `src/pages/CreateRatingPage.tsx`). The table's access rules let anyone with the publishable key read and insert ratings, which is fine for a class prototype but not for production. When auth is added, follow the comments in `supabase/ratings.sql` to lock inserts to `auth.uid()`.

### Later

- Point `listTimeline` / `listPostsByAuthor` in `src/lib/api.ts` at the `ratings` table. Right now a saved rating is copied into the local mock feed so it appears on the timeline.
- In `src/context/SessionContext.tsx`, load the user from `supabase.auth.getSession()` and subscribe to `onAuthStateChange`.
- Move uploaded covers (currently stored inline as data URLs) to a Storage bucket.
