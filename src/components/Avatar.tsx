import type { Profile } from "../types";

// Muted tones that sit on the paper background; picked deterministically per user.
const TONES = ["#d8cfc0", "#c9d3cc", "#d6c8c8", "#cbcdd8", "#d9d3bd", "#c4d0d6"];

function toneFor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

interface AvatarProps {
  profile: Pick<Profile, "id" | "displayName" | "avatarUrl">;
  size?: number;
  className?: string;
}

export function Avatar({ profile, size = 40, className = "" }: AvatarProps) {
  const style = { width: size, height: size };
  if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt=""
        style={style}
        className={`shrink-0 rounded-full border border-line object-cover ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ ...style, backgroundColor: toneFor(profile.id), fontSize: size * 0.38 }}
      className={`grid shrink-0 place-items-center rounded-full border border-line font-serif text-ink ${className}`}
    >
      {initials(profile.displayName)}
    </span>
  );
}
