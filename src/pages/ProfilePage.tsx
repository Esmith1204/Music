import { useState, type ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router";
import { AlbumCover } from "../components/AlbumCover";
import { Avatar } from "../components/Avatar";
import { CheckIcon, GridIcon, ListIcon, PlusIcon } from "../components/Icons";
import { PostCard } from "../components/PostCard";
import { RatingHistogram } from "../components/RatingHistogram";
import { useSession } from "../context/SessionContext";
import { useAsync } from "../hooks/useAsync";
import { getProfileByHandle, isFollowing, listPostsByAuthor, setFollowing } from "../lib/api";
import { formatRating } from "../lib/format";
import type { PostWithAuthor, ProfileWithStats } from "../types";

/** /profile — sends the signed-in user to their own page. */
export function MyProfileRedirect() {
  const { user, loading } = useSession();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={`/u/${user.handle}`} replace />;
}

/** /u/:handle — keyed by handle so state resets when moving between profiles. */
export function ProfileRoute() {
  const { handle = "" } = useParams();
  return <ProfilePage key={handle} handle={handle} />;
}

async function loadProfile(handle: string) {
  const profile = await getProfileByHandle(handle);
  if (!profile) return null;
  const [posts, following] = await Promise.all([listPostsByAuthor(profile.id), isFollowing(profile.id)]);
  return { profile, posts, following };
}

function ProfilePage({ handle }: { handle: string }) {
  const { user } = useSession();
  const { data, loading, error, reload } = useAsync(() => loadProfile(handle), [handle]);
  const [view, setView] = useState<"grid" | "list">("grid");

  if (error) {
    return <Message title="This profile didn't load." body={error.message} />;
  }
  if (loading && data === undefined) {
    return <ProfileSkeleton />;
  }
  if (!data) {
    return <Message title="No listener here." body={`We couldn't find anyone with the handle @${handle}.`} />;
  }

  const { profile, posts, following } = data;
  const isMe = user?.id === profile.id;
  const highestRated = [...posts].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const showHighestRated = posts.length > highestRated.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-10 sm:pt-14">
      <ProfileHeader profile={profile} isMe={isMe} following={following} onFollowChange={reload} />

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          {posts.length === 0 ? (
            <div className="border border-line bg-card px-6 py-14 text-center">
              <p className="font-serif text-2xl">No ratings yet.</p>
              <p className="mt-2 text-sm text-muted">
                {isMe ? "Rate your first album to start your profile." : `${profile.displayName} hasn't rated anything yet.`}
              </p>
              {isMe && (
                <Link to="/rate" className="eyebrow mt-6 inline-block bg-ink px-5 py-3 text-paper">
                  Rate an album
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Only worth showing once it isn't just the full list again. */}
              {showHighestRated && (
                <section aria-labelledby="top-rated" className="mb-12">
                  <SectionHeading id="top-rated">Highest rated</SectionHeading>
                  <ul className="mt-4 grid grid-cols-4 gap-2 sm:gap-4">
                    {highestRated.map((post) => (
                      <li key={post.id}>
                        <RatingTile post={post} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section aria-labelledby="all-ratings">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <h2 id="all-ratings" className="eyebrow text-muted">
                    All ratings <span className="ml-1 text-ink">{posts.length}</span>
                  </h2>
                  <div className="flex gap-1" role="group" aria-label="Layout">
                    <ViewToggle active={view === "grid"} label="Grid view" onClick={() => setView("grid")}>
                      <GridIcon size={16} />
                    </ViewToggle>
                    <ViewToggle active={view === "list"} label="List view" onClick={() => setView("list")}>
                      <ListIcon size={16} />
                    </ViewToggle>
                  </div>
                </div>

                {view === "grid" ? (
                  <ul className="mt-5 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5">
                    {posts.map((post) => (
                      <li key={post.id}>
                        <RatingTile post={post} showTitle />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="mt-5 flex flex-col gap-4">
                    {posts.map((post) => (
                      <li key={post.id}>
                        <PostCard post={post} />
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-10">
          <RatingHistogram ratings={posts.map((p) => p.rating)} />
          {posts.some((p) => p.review) && (
            <section aria-labelledby="recent-reviews">
              <SectionHeading id="recent-reviews">Recent reviews</SectionHeading>
              <ul className="mt-3 flex flex-col divide-y divide-line">
                {posts
                  .filter((p) => p.review)
                  .slice(0, 3)
                  .map((post) => (
                    <li key={post.id} className="py-3">
                      <p className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{post.album.title}</span>
                        <span className="tabular-nums">{formatRating(post.rating)}</span>
                      </p>
                      <p className="mt-1 line-clamp-3 font-serif text-[15px] leading-snug text-muted">{post.review}</p>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

interface ProfileHeaderProps {
  profile: ProfileWithStats;
  isMe: boolean;
  following: boolean;
  onFollowChange: () => void;
}

function ProfileHeader({ profile, isMe, following, onFollowChange }: ProfileHeaderProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFriend = async () => {
    setPending(true);
    setError(null);
    try {
      await setFollowing(profile.id, !following);
      onFollowChange();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <header className="flex flex-col gap-6 border-b border-rule pb-8 md:flex-row md:items-center md:gap-8">
      <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-6">
        <Avatar profile={profile} size={104} className="hidden sm:grid" />
        <Avatar profile={profile} size={72} className="sm:hidden" />
        <div className="min-w-0">
          <h1 className="truncate font-serif text-4xl leading-tight tracking-tight sm:text-5xl">{profile.displayName}</h1>
          <p className="text-sm text-muted">@{profile.handle}</p>
          {profile.bio && <p className="mt-2 max-w-md text-sm leading-relaxed">{profile.bio}</p>}
        </div>
      </div>

      <dl className="flex divide-x divide-line">
        <Stat label="Posts" value={profile.postCount} />
        <Stat label="Followers" value={profile.followerCount} />
        <Stat label="Following" value={profile.followingCount} />
      </dl>

      <div className="flex flex-col gap-1 md:w-44">
        {isMe ? (
          <Link
            to="/rate"
            className="eyebrow flex h-12 items-center justify-center gap-2 bg-ink px-5 text-paper transition-opacity hover:opacity-90"
          >
            <PlusIcon size={14} strokeWidth={2.2} />
            New rating
          </Link>
        ) : following ? (
          <button
            type="button"
            onClick={toggleFriend}
            disabled={pending}
            aria-pressed="true"
            className="group eyebrow flex h-12 items-center justify-center gap-2 border border-ink px-5 transition-colors hover:border-danger hover:text-danger disabled:opacity-60"
          >
            <CheckIcon size={14} strokeWidth={2.2} className="group-hover:hidden" />
            <span className="group-hover:hidden">Friends</span>
            <span className="hidden group-hover:inline">Remove friend</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleFriend}
            disabled={pending}
            aria-pressed="false"
            className="eyebrow flex h-12 items-center justify-center gap-2 bg-ink px-5 text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <PlusIcon size={14} strokeWidth={2.2} />
            Add friend
          </button>
        )}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse items-center px-5 first:pl-0 md:first:pl-5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="font-serif text-3xl tabular-nums">{value.toLocaleString()}</dd>
    </div>
  );
}

function RatingTile({ post, showTitle }: { post: PostWithAuthor; showTitle?: boolean }) {
  return (
    <figure title={post.review || undefined}>
      <AlbumCover
        src={post.album.coverUrl}
        title={post.album.title}
        className="border border-line transition-transform hover:-translate-y-0.5"
      />
      <figcaption className="mt-1.5 text-xs">
        <span className="font-semibold tabular-nums">{formatRating(post.rating)}</span>
        {showTitle && <span className="mt-0.5 block truncate text-muted">{post.album.title}</span>}
      </figcaption>
    </figure>
  );
}

function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="eyebrow border-b border-line pb-2 text-muted">
      {children}
    </h2>
  );
}

function ViewToggle({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`p-1.5 transition-colors ${active ? "text-ink" : "text-muted hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-24 text-center">
      <p className="font-serif text-3xl">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <Link to="/" className="eyebrow mt-8 inline-block bg-ink px-5 py-3 text-paper">
        Back to timeline
      </Link>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 pt-14 sm:px-10" aria-busy="true" aria-label="Loading profile">
      <div className="flex items-center gap-6 border-b border-line pb-8">
        <div className="size-[104px] shrink-0 rounded-full bg-field" />
        <div className="h-10 w-64 bg-field" />
      </div>
      <div className="mt-10 grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-field" />
        ))}
      </div>
    </div>
  );
}
