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

// The single data-access module the UI talks to. Every function is async and
// returns app-level types, so swapping the mock implementation for Supabase
// queries (see src/lib/supabase.ts and supabase/schema.sql) won't touch any
// components.
//
// TODO(supabase): replace each mock body with the matching query, e.g.
//   listTimeline  -> supabase.from("posts").select("*, author:profiles(*)").order("created_at", { ascending: false })
//   createPost    -> upload cover to storage if it's a data URL, then supabase.from("posts").insert(...)
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

export async function createPost(input: NewPostInput): Promise<PostWithAuthor> {
  const post: Post = {
    id: crypto.randomUUID(),
    authorId: CURRENT_USER_ID,
    album: input.album,
    rating: input.rating,
    review: input.review,
    createdAt: new Date().toISOString(),
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
