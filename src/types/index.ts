// App-level domain types (camelCase). The Supabase row types live in
// ./database.ts; the data layer in src/lib/api.ts maps between the two.

export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface ProfileWithStats extends Profile {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export interface Album {
  title: string;
  artist: string | null;
  year: number | null;
  coverUrl: string;
}

export interface Post {
  id: string;
  authorId: string;
  album: Album;
  /** 0.0 – 10.0, one decimal place. */
  rating: number;
  /** At most 150 characters. Empty string when the user skipped it. */
  review: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
}

export interface PostWithAuthor extends Post {
  author: Profile;
}

export interface NewPostInput {
  album: Album;
  rating: number;
  review: string;
}

export type FeedScope = "everyone" | "friends";
