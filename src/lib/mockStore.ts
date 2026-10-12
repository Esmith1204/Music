import type { Post } from "../types";
import { seedFollowing } from "./mockData";

// localStorage-backed state for the mock data layer, so posts and friend
// requests survive a reload. Everything here goes away once Supabase is wired up.

const STORAGE_KEY = "musicrater:mock:v1";

interface MockState {
  /** Posts the current user created in this browser (seed posts are not stored). */
  posts: Post[];
  /** Profile ids the current user follows. */
  following: string[];
}

function load(): MockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockState;
  } catch {
    // Storage blocked or corrupt — fall through to defaults.
  }
  return { posts: [], following: [...seedFollowing] };
}

let state = load();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage blocked; state still lives in memory.
  }
}

export const mockStore = {
  get posts() {
    return state.posts;
  },
  get following() {
    return state.following;
  },
  addPost(post: Post) {
    state = { ...state, posts: [post, ...state.posts] };
    save();
  },
  setFollowing(profileId: string, follow: boolean) {
    const rest = state.following.filter((id) => id !== profileId);
    state = { ...state, following: follow ? [...rest, profileId] : rest };
    save();
  },
};
