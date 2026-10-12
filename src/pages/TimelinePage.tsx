import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { PostCard } from "../components/PostCard";
import { useAsync } from "../hooks/useAsync";
import { listTimeline } from "../lib/api";
import type { FeedScope } from "../types";

const SCOPES: { value: FeedScope; label: string }[] = [
  { value: "everyone", label: "Everyone" },
  { value: "friends", label: "Friends" },
];

export function TimelinePage() {
  const [scope, setScope] = useState<FeedScope>("everyone");
  const { data: posts, loading, error, reload } = useAsync(() => listTimeline(scope), [scope]);

  const location = useLocation();
  const navigate = useNavigate();
  const justPosted = (location.state as { justPosted?: string } | null)?.justPosted;

  return (
    <div className="mx-auto w-full max-w-[56rem] px-4 pb-24 pt-8 sm:pt-20">
      {justPosted && (
        <div role="status" className="mb-4 flex items-center justify-between border border-line bg-card px-4 py-3 text-xs">
          <span>Your review is live on the timeline.</span>
          <button
            type="button"
            onClick={() => navigate(".", { replace: true, state: null })}
            className="text-muted hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      )}

      <div role="tablist" aria-label="Feed" className="mb-4 flex border-b border-line">
        {SCOPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={scope === value}
            onClick={() => setScope(value)}
            className={`eyebrow -mb-px flex-1 border-b-2 py-3 transition-colors ${
              scope === value ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="border border-line bg-card px-6 py-10 text-center">
          <p className="font-serif text-xl">The timeline didn't load.</p>
          <p className="mt-1 text-sm text-muted">{error.message}</p>
          <button type="button" onClick={reload} className="eyebrow mt-5 bg-ink px-5 py-3 text-paper">
            Try again
          </button>
        </div>
      ) : loading && !posts ? (
        <FeedSkeleton />
      ) : posts && posts.length > 0 ? (
        <ol className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="border border-line bg-card px-6 py-14 text-center">
          <p className="font-serif text-2xl">Nothing here yet.</p>
          <p className="mt-2 text-sm text-muted">
            {scope === "friends"
              ? "Add friends from their profiles to see their ratings here."
              : "Be the first to rate something."}
          </p>
          <Link to="/rate" className="eyebrow mt-6 inline-block bg-ink px-5 py-3 text-paper">
            Rate an album
          </Link>
        </div>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading timeline">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse border border-line bg-card p-6">
          <div className="h-4 w-48 bg-field" />
          <div className="mt-4 grid grid-cols-[5fr_7fr] border border-line">
            <div className="aspect-square bg-field" />
            <div />
          </div>
          <div className="mt-5 h-4 w-2/3 bg-field" />
        </div>
      ))}
    </div>
  );
}
