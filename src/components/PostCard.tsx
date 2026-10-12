import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { PostWithAuthor } from "../types";
import { firstName, formatRating, timeAgo } from "../lib/format";
import { AlbumCover } from "./AlbumCover";
import { Avatar } from "./Avatar";
import { BookmarkIcon, CommentIcon, HeartIcon, MoreIcon, RepostIcon } from "./Icons";

export function PostCard({ post }: { post: PostWithAuthor }) {
  const { author, album } = post;
  const profileHref = `/u/${author.handle}`;
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <article className="border border-line bg-card">
      <header className="flex items-center gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
        <Link to={profileHref} className="shrink-0">
          <Avatar profile={author} size={36} />
        </Link>
        <p className="min-w-0 flex-1 truncate text-sm">
          <Link to={profileHref} className="font-semibold hover:underline">
            {author.displayName}
          </Link>{" "}
          <span className="text-muted">
            @{author.handle} · <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </span>
        </p>
        <button
          type="button"
          aria-label="More options"
          className="-mr-1 rounded-full p-1.5 text-ink hover:bg-field"
        >
          <MoreIcon size={20} />
        </button>
      </header>

      <div className="mx-4 mt-4 grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] border border-ink sm:mx-6">
        <AlbumCover src={album.coverUrl} title={album.title} className="border-r border-ink" />
        <div className="flex min-w-0 flex-col p-3 sm:p-8">
          <p className="text-[9px] font-semibold tracking-[0.16em] sm:text-[10px]">
            {firstName(author.displayName)}&rsquo;s Rating
          </p>
          <h3 className="mt-1 line-clamp-2 text-lg leading-tight tracking-tight sm:mt-2 sm:text-[2rem]">
            {album.title}
          </h3>
          {album.artist && (
            <p className="mt-1 truncate text-xs text-muted sm:text-sm">
              {album.artist}
              {album.year ? ` · ${album.year}` : ""}
            </p>
          )}
          <p className="mt-auto pt-2 leading-none">
            <span className="text-4xl tracking-tighter tabular-nums sm:text-[4rem]">
              {formatRating(post.rating)}
            </span>
            <span className="ml-1 text-xs text-muted sm:text-sm">/ 10</span>
          </p>
        </div>
      </div>

      <p className="px-4 py-4 font-serif text-lg leading-snug sm:px-6 sm:py-5 sm:text-xl">
        {post.review || <span className="text-muted">No review provided.</span>}
      </p>

      <footer className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-muted sm:px-8 sm:py-4">
        <ActionButton label="Comments" count={post.commentCount}>
          <CommentIcon />
        </ActionButton>
        <ActionButton label="Reposts" count={post.repostCount}>
          <RepostIcon />
        </ActionButton>
        <ActionButton
          label={liked ? "Unlike" : "Like"}
          count={post.likeCount + (liked ? 1 : 0)}
          active={liked}
          onClick={() => setLiked((v) => !v)}
        >
          <HeartIcon filled={liked} />
        </ActionButton>
        <ActionButton label={saved ? "Remove bookmark" : "Bookmark"} active={saved} onClick={() => setSaved((v) => !v)}>
          <BookmarkIcon filled={saved} />
        </ActionButton>
      </footer>
    </article>
  );
}

interface ActionButtonProps {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

function ActionButton({ label, count, active, onClick, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={onClick ? active : undefined}
      onClick={onClick}
      className={`-m-2 flex items-center gap-2 rounded-full p-2 transition-colors hover:text-ink ${
        active ? "text-ink" : ""
      }`}
    >
      {children}
      {count !== undefined && <span className="tabular-nums">{count}</span>}
    </button>
  );
}
