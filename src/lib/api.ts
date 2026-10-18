import type {
  FeedScope,
  NewPostInput,
  Post,
  PostWithAuthor,
  Profile,
  ProfileWithStats,
} from "../types";
import {
  CURRENT_USER_ID,
  seedFollowerBase,
  seedFollowingBase,
  seedPosts,
  seedProfiles,
} from "./mockData";
import { mockStore } from "./mockStore";
import { missingSupabaseEnv, supabase } from "./supabase";

// The single data-access module the UI talks to. Every function is async and
// returns app-level types, so swapping the mock implementation for Supabase
// queries (see src/lib/supabase.ts and supabase/schema.sql) won't touch any
// components.
//
// saveRating already writes to Supabase. TODO(supabase): replace the remaining
// mock bodies with the matching query, e.g.
//   listTimeline  -> supabase.from("ratings").select("*").order("created_at", { ascending: false })
//   setFollowing  -> supabase.from("friendships").insert / delete
//   getCurrentUser-> supabase.auth.getUser() + profiles row

const profilesById = new Map(seedProfiles.map((p) => [p.id, p]));

function allPosts(): Post[] {
  return [...mockStore.posts, ...seedPosts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function withAuthor(post: Post): PostWithAuthor {
  const author = profilesById.get(post.authorId);
  if (!author) throw new Error(`Unknown author ${post.authorId}`);
  return { ...post, author };
}

export async function getCurrentUser(): Promise<Profile> {
  return profilesById.get(CURRENT_USER_ID)!;
}

export async function listTimeline(scope: FeedScope): Promise<PostWithAuthor[]> {
  const posts = allPosts();
  if (scope === "everyone") return posts.map(withAuthor);
  const visible = new Set([CURRENT_USER_ID, ...mockStore.following]);
  return posts.filter((p) => visible.has(p.authorId)).map(withAuthor);
}

export async function getProfileByHandle(handle: string): Promise<ProfileWithStats | null> {
  const profile = seedProfiles.find((p) => p.handle.toLowerCase() === handle.toLowerCase());
  if (!profile) return null;

  const isFollowedByMe = mockStore.following.includes(profile.id);
  const followingCount =
    profile.id === CURRENT_USER_ID ? mockStore.following.length : (seedFollowingBase[profile.id] ?? 0);

  return {
    ...profile,
    postCount: allPosts().filter((p) => p.authorId === profile.id).length,
    followerCount: (seedFollowerBase[profile.id] ?? 0) + (isFollowedByMe ? 1 : 0),
    followingCount,
  };
}

export async function listPostsByAuthor(authorId: string): Promise<PostWithAuthor[]> {
  return allPosts()
    .filter((p) => p.authorId === authorId)
    .map(withAuthor);
}

/**
 * Saves a rating to the Supabase `ratings` table (supabase/ratings.sql).
 * `userId` is the hardcoded dummy user until auth exists. Throws if Supabase
 * isn't configured, so a rating is never silently kept only in the browser.
 */
export async function saveRating(userId: string, input: NewPostInput): Promise<PostWithAuthor> {
  if (!supabase) {
    throw new Error(
      `Supabase isn't connected: this build is missing ${missingSupabaseEnv.join(" and ")}. ` +
        "Set it in .env.local (then restart npm run dev) or in Vercel (then redeploy).",
    );
  }

  const { data: row, error } = await supabase
    .from("ratings")
    .insert({
      user_id: userId,
      album_title: input.album.title,
      album_artist: input.album.artist,
      album_year: input.album.year,
      cover_url: input.album.coverUrl,
      rating: input.rating,
      review: input.review,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // The timeline still reads mock data, so mirror the saved row into it.
  // The dummy user is shown as the mock current user.
  const post: Post = {
    id: row.id,
    authorId: CURRENT_USER_ID,
    album: {
      title: row.album_title,
      artist: row.album_artist,
      year: row.album_year,
      coverUrl: row.cover_url,
    },
    rating: Number(row.rating),
    review: row.review,
    createdAt: row.created_at,
    likeCount: 0,
    commentCount: 0,
    repostCount: 0,
  };
  mockStore.addPost(post);
  return withAuthor(post);
}

export async function isFollowing(profileId: string): Promise<boolean> {
  return mockStore.following.includes(profileId);
}

export async function setFollowing(profileId: string, follow: boolean): Promise<void> {
  if (profileId === CURRENT_USER_ID) throw new Error("You can't add yourself as a friend.");
  mockStore.setFollowing(profileId, follow);
}
