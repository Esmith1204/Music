import type { Album, Post, Profile } from "../types";

// Seed data for the mock data layer. Covers are Apple Music artwork URLs.

export const CURRENT_USER_ID = "u-elijah";

export const seedProfiles: Profile[] = [
  {
    id: CURRENT_USER_ID,
    handle: "swrd.fsh",
    displayName: "Elijah Smith",
    avatarUrl: null,
    bio: "Mostly art rock, some rap, too much Radiohead.",
  },
  {
    id: "u-maya",
    handle: "mayalistens",
    displayName: "Maya Okafor",
    avatarUrl: null,
    bio: "R&B and anything with strings.",
  },
  {
    id: "u-theo",
    handle: "theo.spins",
    displayName: "Theo Park",
    avatarUrl: null,
    bio: "Vinyl first. Liner notes second.",
  },
  {
    id: "u-priya",
    handle: "priyaonrepeat",
    displayName: "Priya Raman",
    avatarUrl: null,
    bio: "If it has a synth, I'm in.",
  },
  {
    id: "u-jonah",
    handle: "jonahrecords",
    displayName: "Jonah Reyes",
    avatarUrl: null,
    bio: "Hip-hop head. Rating everything I hear in 2026.",
  },
];

/** Followers that aren't modelled as real users, so counts look lived-in. */
export const seedFollowerBase: Record<string, number> = {
  [CURRENT_USER_ID]: 41,
  "u-maya": 312,
  "u-theo": 128,
  "u-priya": 87,
  "u-jonah": 205,
};

export const seedFollowingBase: Record<string, number> = {
  [CURRENT_USER_ID]: 0,
  "u-maya": 140,
  "u-theo": 66,
  "u-priya": 92,
  "u-jonah": 118,
};

/** Who the current user already follows when the app first loads. */
export const seedFollowing: string[] = ["u-maya", "u-jonah"];

const art = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x600bb.jpg`;

const albums = {
  inRainbows: {
    title: "In Rainbows",
    artist: "Radiohead",
    year: 2007,
    coverUrl: art("Music126/v4/dd/50/c7/dd50c790-99ac-d3d0-5ab8-e3891fb8fd52/634904032463.png"),
  },
  kidA: {
    title: "Kid A",
    artist: "Radiohead",
    year: 2000,
    coverUrl: art("Music122/v4/bd/8e/13/bd8e1358-b367-a689-cb84-cebd0b067dc4/634904078263.png"),
  },
  tpab: {
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    year: 2015,
    coverUrl: art("Music112/v4/b5/a6/91/b5a69171-5232-3d5b-9c15-8963802f83dd/15UMGIM15814.rgb.jpg"),
  },
  gnx: {
    title: "GNX",
    artist: "Kendrick Lamar",
    year: 2024,
    coverUrl: art("Music221/v4/54/28/14/54281424-eece-0935-299d-fdd2ab403f92/24UM1IM28978.rgb.jpg"),
  },
  sos: {
    title: "SOS",
    artist: "SZA",
    year: 2022,
    coverUrl: art("Music122/v4/62/93/13/6293132e-20ff-67ab-3d1f-96bb6797a6ba/196589564955.jpg"),
  },
  rumours: {
    title: "Rumours",
    artist: "Fleetwood Mac",
    year: 1977,
    coverUrl: art("Music124/v4/4d/13/ba/4d13bac3-d3d5-7581-2c74-034219eadf2b/081227970949.jpg"),
  },
  ram: {
    title: "Random Access Memories",
    artist: "Daft Punk",
    year: 2013,
    coverUrl: art("Music116/v4/86/b1/92/86b192cf-ceb6-6e51-9361-dc4a35e95d22/196589921154.jpg"),
  },
  hmhas: {
    title: "HIT ME HARD AND SOFT",
    artist: "Billie Eilish",
    year: 2024,
    coverUrl: art("Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg"),
  },
  vespertine: {
    title: "Vespertine",
    artist: "Björk",
    year: 2001,
    coverUrl: art("Music116/v4/32/d6/28/32d62861-0e24-2111-d3ed-3b54f23083d5/081227607265.jpg"),
  },
} satisfies Record<string, Album>;

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

let n = 0;
const post = (
  authorId: string,
  album: Album,
  rating: number,
  review: string,
  ageMinutes: number,
  likes = 0,
): Post => ({
  id: `seed-${++n}`,
  authorId,
  album,
  rating,
  review,
  createdAt: minutesAgo(ageMinutes),
  likeCount: likes,
  commentCount: Math.floor(likes / 4),
  repostCount: Math.floor(likes / 7),
});

export const seedPosts: Post[] = [
  post("u-maya", albums.sos, 8.7, "Kill Bill and Snooze back to back is unfair. Long, but almost every track earns its spot.", 12, 24),
  post("u-jonah", albums.gnx, 8.1, "Tighter than I expected. squabble up goes crazy, but the back half is where it really lands.", 47, 31),
  post("u-theo", albums.rumours, 9.4, "Still the gold standard for a breakup record. Dreams on a Sunday morning, every time.", 95, 18),
  post("u-priya", albums.ram, 8.9, "Giorgio by Moroder is nine minutes of pure joy. Sounds expensive in the best way.", 180, 12),
  post(CURRENT_USER_ID, albums.inRainbows, 9.6, "Reckoner might be the prettiest thing they've ever made. Front to back perfect.", 300, 9),
  post("u-maya", albums.hmhas, 8.3, "Birds of a feather is the hit, but L'Amour de Ma Vie's switch-up is the moment.", 520, 40),
  post("u-jonah", albums.tpab, 9.8, "A whole education in 79 minutes. Alright still hits like it's 2015.", 1_440, 57),
  post("u-theo", albums.vespertine, 9.0, "Headphone record. Pagan Poetry gave me chills on the train this morning.", 2_100, 7),
  post(CURRENT_USER_ID, albums.kidA, 9.2, "Everything In Its Right Place still sounds like the future, somehow.", 2_880, 14),
  post("u-priya", albums.sos, 7.6, "Some real highs, but 23 tracks is a lot. Would love a tighter cut.", 4_320, 5),
  post(CURRENT_USER_ID, albums.gnx, 7.9, "Fun, punchy, and short. Not TPAB, but it isn't trying to be.", 5_760, 6),
];
