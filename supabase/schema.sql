-- Music Rater: initial schema.
-- Run in Supabase → SQL Editor (or `supabase db push` once the CLI is set up).
-- Keep src/types/database.ts in sync (regenerate with `supabase gen types`).

-- ─── Profiles ───────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  handle       text not null unique check (handle ~ '^[a-z0-9_.]{2,30}$'),
  display_name text not null check (char_length(display_name) between 1 and 60),
  avatar_url   text,
  bio          text check (char_length(bio) <= 160),
  created_at   timestamptz not null default now()
);

-- ─── Posts (one rating + optional short review) ─────────────────────────────
create table public.posts (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles (id) on delete cascade,
  album_title  text not null check (char_length(album_title) between 1 and 200),
  album_artist text,
  album_year   int,
  cover_url    text not null,
  -- 10-point decimal scale: 0.0 – 10.0, one decimal place.
  rating       numeric(3, 1) not null check (rating >= 0 and rating <= 10),
  review       text not null default '' check (char_length(review) <= 150),
  created_at   timestamptz not null default now()
);

create index posts_author_created_idx on public.posts (author_id, created_at desc);
create index posts_created_idx on public.posts (created_at desc);

-- ─── Friendships ("Add friend" = follow) ────────────────────────────────────
create table public.friendships (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index friendships_following_idx on public.friendships (following_id);

-- ─── Profile stats for the profile header ───────────────────────────────────
create view public.profile_stats with (security_invoker = true) as
select
  p.id,
  (select count(*) from public.posts       where author_id    = p.id)::int as post_count,
  (select count(*) from public.friendships where following_id = p.id)::int as follower_count,
  (select count(*) from public.friendships where follower_id  = p.id)::int as following_count
from public.profiles p;

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.friendships enable row level security;

create policy "Profiles are public"        on public.profiles for select using (true);
create policy "Users update own profile"   on public.profiles for update using (auth.uid() = id);

create policy "Posts are public"           on public.posts for select using (true);
create policy "Users create own posts"     on public.posts for insert with check (auth.uid() = author_id);
create policy "Users delete own posts"     on public.posts for delete using (auth.uid() = author_id);

create policy "Friendships are public"     on public.friendships for select using (true);
create policy "Users add friends"          on public.friendships for insert with check (auth.uid() = follower_id);
create policy "Users remove friends"       on public.friendships for delete using (auth.uid() = follower_id);

-- ─── Create a profile row when someone signs up ─────────────────────────────
-- Expects `handle` and `display_name` in the sign-up metadata:
--   supabase.auth.signUp({ email, password, options: { data: { handle, display_name } } })
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, handle, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'handle',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'handle')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Storage: uploaded album covers ─────────────────────────────────────────
-- Files go under `<user id>/<file>` so the policy can check ownership.
insert into storage.buckets (id, name, public) values ('album-covers', 'album-covers', true)
on conflict (id) do nothing;

create policy "Album covers are public"
  on storage.objects for select using (bucket_id = 'album-covers');

create policy "Users upload their own covers"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'album-covers' and (storage.foldername(name))[1] = auth.uid()::text);
