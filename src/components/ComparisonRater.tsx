import { useState } from "react";
import {
  answerComparison,
  comparisonPool,
  maxComparisons,
  nextComparison,
  scoreAtPosition,
  SENTIMENTS,
  startSearch,
  type SearchRange,
  type Sentiment,
} from "../lib/compareRank";
import { formatRating } from "../lib/format";
import type { Album, Post } from "../types";
import { AlbumCover } from "./AlbumCover";

interface ComparisonRaterProps {
  album: Album;
  pastRatings: Post[];
  /** The chosen score once placement is known, or null while unfinished. */
  onScore: (score: number | null) => void;
}

type State =
  | { step: "sentiment" }
  | { step: "comparing"; sentiment: Sentiment; pool: Post[]; range: SearchRange; asked: number }
  | { step: "done"; sentiment: Sentiment; pool: Post[]; index: number; score: number; tiedWith: Post | null };

/** Beli-style rating: pick a feeling, then answer "which did you like more?" until the score is found. */
export function ComparisonRater({ album, pastRatings, onScore }: ComparisonRaterProps) {
  const [state, setState] = useState<State>({ step: "sentiment" });

  const finish = (sentiment: Sentiment, pool: Post[], index: number, tiedWith: Post | null = null) => {
    const score = tiedWith ? tiedWith.rating : scoreAtPosition(pool, index, sentiment);
    setState({ step: "done", sentiment, pool, index, score, tiedWith });
    onScore(score);
  };

  const chooseSentiment = (sentiment: Sentiment) => {
    const pool = comparisonPool(pastRatings, sentiment, album);
    const range = startSearch(pool);
    if (nextComparison(range) === null) finish(sentiment, pool, 0);
    else setState({ step: "comparing", sentiment, pool, range, asked: 0 });
  };

  const answer = (preferNew: boolean) => {
    if (state.step !== "comparing") return;
    const range = answerComparison(state.range, preferNew);
    if (nextComparison(range) === null) finish(state.sentiment, state.pool, range.lo);
    else setState({ ...state, range, asked: state.asked + 1 });
  };

  const restart = () => {
    setState({ step: "sentiment" });
    onScore(null);
  };

  if (state.step === "sentiment") {
    return (
      <div>
        <p className="text-sm">How did you feel about <span className="font-medium">{album.title}</span>?</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(Object.keys(SENTIMENTS) as Sentiment[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => chooseSentiment(key)}
              className="border border-line bg-card px-3 py-3 text-left transition-colors hover:border-ink"
            >
              <span className="block text-sm font-medium">{SENTIMENTS[key].label}</span>
              <span className="block text-xs text-muted tabular-nums">
                {formatRating(SENTIMENTS[key].min)}–{formatRating(SENTIMENTS[key].max)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state.step === "comparing") {
    const other = state.pool[nextComparison(state.range)!];
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium">Which did you like more?</p>
          <p className="text-xs text-muted tabular-nums">
            Question {state.asked + 1} of up to {maxComparisons(state.pool.length)}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ChoiceCard album={album} label="New" onClick={() => answer(true)} />
          <ChoiceCard album={other.album} label="Rated before" onClick={() => answer(false)} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => finish(state.sentiment, state.pool, nextComparison(state.range)!, other)}
            className="font-medium text-muted underline underline-offset-4 hover:text-ink"
          >
            Too close to call
          </button>
          <button type="button" onClick={restart} className="text-muted hover:text-ink">
            Start over
          </button>
        </div>
      </div>
    );
  }

  const above = state.index > 0 ? state.pool[state.index - 1] : null;
  const below = state.index < state.pool.length ? state.pool[state.index] : null;
  return (
    <div className="border border-ink bg-card p-4" aria-live="polite">
      <p className="eyebrow text-muted">Your score</p>
      <p className="mt-1 text-5xl leading-none tracking-tighter tabular-nums">
        {formatRating(state.score)}
        <span className="ml-1 text-sm tracking-normal text-muted">/ 10</span>
      </p>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        {state.tiedWith ? (
          <>Same score as <Ref post={state.tiedWith} />.</>
        ) : state.pool.length === 0 ? (
          <>Nothing else in the “{SENTIMENTS[state.sentiment].label.toLowerCase()}” range yet, so it starts in the middle.</>
        ) : above && below ? (
          <>Ranked between <Ref post={above} /> and <Ref post={below} />.</>
        ) : below ? (
          <>Ranked above <Ref post={below} />, your best in this range.</>
        ) : (
          <>Ranked below <Ref post={above!} /> in this range.</>
        )}
      </p>
      <button type="button" onClick={restart} className="mt-3 text-xs font-medium underline underline-offset-4">
        Start over
      </button>
    </div>
  );
}

function ChoiceCard({ album, label, onClick }: { album: Album; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group border border-line bg-card p-2 text-left transition-colors hover:border-ink focus-visible:border-ink"
    >
      <AlbumCover src={album.coverUrl} title={album.title} className="border border-line" />
      <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      <span className="block truncate text-sm font-medium group-hover:underline">{album.title}</span>
      {album.artist && <span className="block truncate text-xs text-muted">{album.artist}</span>}
    </button>
  );
}

function Ref({ post }: { post: Post }) {
  return (
    <span className="text-ink">
      {post.album.title} <span className="tabular-nums">({formatRating(post.rating)})</span>
    </span>
  );
}
