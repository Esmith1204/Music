import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { AlbumCover } from "../components/AlbumCover";
import { AlbumSearchField } from "../components/AlbumSearchField";
import { ComparisonRater } from "../components/ComparisonRater";
import { Field } from "../components/FormField";
import { ArrowRightIcon, UploadIcon } from "../components/Icons";
import { RecordRings } from "../components/RecordRings";
import { useCurrentUser } from "../context/SessionContext";
import { useAsync } from "../hooks/useAsync";
import { listRatingsByUser, saveRating } from "../lib/api";
import { COMPARISON_UNLOCK } from "../lib/compareRank";
import {
  fileToCoverDataUrl,
  formatRating,
  parseRating,
  RATING_PARTIAL_PATTERN,
  REVIEW_MAX_LENGTH,
} from "../lib/format";
import type { AlbumSearchResult } from "../lib/itunes";
import type { Album, RatingMethod } from "../types";

interface FieldErrors {
  album?: string;
  rating?: string;
  review?: string;
}

export function CreateRatingPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const fileInput = useRef<HTMLInputElement>(null);
  // The user's past ratings: the comparison pool and the unlock count.
  const past = useAsync(() => listRatingsByUser(user.id), [user.id]);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AlbumSearchResult | null>(null);
  const [uploadedCover, setUploadedCover] = useState<string | null>(null);
  const [method, setMethod] = useState<RatingMethod>("manual");
  const [ratingText, setRatingText] = useState("");
  const [comparisonScore, setComparisonScore] = useState<number | null>(null);
  const [review, setReview] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const coverUrl = uploadedCover ?? selected?.coverUrl ?? null;
  const albumTitle = selected?.title ?? query.trim();
  const album: Album | null =
    albumTitle && coverUrl
      ? { title: albumTitle, artist: selected?.artist ?? null, year: selected?.year ?? null, coverUrl }
      : null;
  const ratingCount = past.data?.length ?? 0;
  const comparisonUnlocked = ratingCount >= COMPARISON_UNLOCK;
  const rating = method === "manual" ? parseRating(ratingText) : comparisonScore;
  const errors = validate();
  const visibleErrors: FieldErrors = attempted ? errors : {};

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!albumTitle) e.album = "Enter the album you listened to.";
    else if (!coverUrl) e.album = "Pick an album from the search results or upload its cover.";
    if (method === "manual") {
      if (rating === null) e.rating = "Use a score from 0.0 to 10.0 with at most one decimal (e.g. 8.5).";
    } else if (!comparisonUnlocked) {
      e.rating = `Rating by comparison needs at least ${COMPARISON_UNLOCK} ratings. Switch to “Score it”.`;
    } else if (rating === null) {
      e.rating = album ? "Finish the comparison to get a score." : "Pick the album first, then compare.";
    }
    if (review.length > REVIEW_MAX_LENGTH) e.review = `Keep it to ${REVIEW_MAX_LENGTH} characters.`;
    return e;
  }

  const onRatingChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(",", ".");
    if (RATING_PARTIAL_PATTERN.test(next)) setRatingText(next);
  };

  const onRatingBlur = () => {
    if (rating !== null) setRatingText(formatRating(rating));
  };

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    try {
      setUploadedCover(await fileToCoverDataUrl(file));
      setComparisonScore(null);
    } catch (err) {
      setUploadError((err as Error).message);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.keys(errors).length > 0 || rating === null || !album) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const post = await saveRating(user.id, { album, rating, review: review.trim(), method });
      navigate("/", { state: { justPosted: post.id } });
    } catch (err) {
      setSubmitting(false);
      setSubmitError(`Couldn't save your rating: ${(err as Error).message}`);
    }
  };

  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <section className="relative overflow-hidden px-6 pb-10 pt-12 sm:px-12 lg:px-24 lg:pb-0 lg:pt-28">
        <h1 className="font-serif text-[clamp(3rem,5.6vw,5.4rem)] leading-[0.9] tracking-[-0.04em]">
          What did you
          <br />
          think of it?
        </h1>
        <p className="mt-8 max-w-[22rem] font-serif text-xl leading-relaxed text-muted lg:mt-12">
          Write your album review and share your thoughts.
        </p>
        <RecordRings coverUrl={coverUrl} className="-mb-40 mt-2 hidden w-[min(36rem,100%)] lg:block" />
      </section>

      <section className="border-t border-rule px-6 py-12 sm:px-12 lg:border-l lg:border-t-0 lg:px-16 lg:py-28">
        <form noValidate onSubmit={onSubmit} className="max-w-[28rem]">
          <p className="eyebrow">Create a review</p>
          <h2 className="mt-3 font-serif text-[2.4rem] leading-tight tracking-tight">Add your latest listen</h2>

          <Field label="Album name" htmlFor="album" error={visibleErrors.album} className="mt-12">
            {(describedBy) => (
              <>
                <AlbumSearchField
                  query={query}
                  selected={selected}
                  onQueryChange={(q) => {
                    setQuery(q);
                    setSelected(null);
                    setComparisonScore(null);
                  }}
                  onSelect={(picked) => {
                    setSelected(picked);
                    setQuery(picked.title);
                    setComparisonScore(null);
                  }}
                  invalid={Boolean(visibleErrors.album)}
                  describedBy={describedBy}
                />
                <div className="mt-3 flex items-center gap-3">
                  <AlbumCover src={coverUrl} title={albumTitle || "your album"} className="size-14 shrink-0 border border-line" />
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="truncate font-medium">
                      {selected
                        ? `${selected.artist}${selected.year ? ` · ${selected.year}` : ""}`
                        : uploadedCover
                          ? albumTitle || "Uploaded cover"
                          : "No cover yet"}
                    </p>
                    <p className="text-muted">
                      {uploadedCover
                        ? "Using your uploaded image"
                        : selected
                          ? "Cover from Apple Music"
                          : "Pick a search result or upload artwork."}
                    </p>
                  </div>
                  {uploadedCover ? (
                    <button
                      type="button"
                      onClick={() => setUploadedCover(null)}
                      className="shrink-0 text-xs font-medium text-muted underline underline-offset-2 hover:text-ink"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="flex shrink-0 items-center gap-1.5 border border-line px-3 py-2 text-xs font-medium hover:border-ink"
                    >
                      <UploadIcon size={14} />
                      Upload cover
                    </button>
                  )}
                  <input ref={fileInput} type="file" accept="image/*" hidden onChange={onUpload} />
                </div>
                {uploadError && <p className="mt-2 text-xs text-danger">{uploadError}</p>}
              </>
            )}
          </Field>

          <Field
            label="Your rating"
            htmlFor={method === "manual" ? "rating" : "rating-mode-compare"}
            error={visibleErrors.rating}
            className="mt-7"
          >
            {(describedBy) => (
              <>
                <div role="radiogroup" aria-label="How to rate" className="mb-3 grid grid-cols-2 border border-line p-1">
                  <ModeButton id="rating-mode-manual" active={method === "manual"} onClick={() => setMethod("manual")}>
                    Score it
                  </ModeButton>
                  <ModeButton id="rating-mode-compare" active={method === "comparison"} onClick={() => setMethod("comparison")}>
                    Compare
                    {!comparisonUnlocked && !past.loading && (
                      <span className="ml-1 font-normal opacity-70">· {COMPARISON_UNLOCK}+ ratings</span>
                    )}
                  </ModeButton>
                </div>

                {method === "manual" ? (
                  <>
                    <div className="relative">
                      <input
                        id="rating"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="Score out of 10"
                        value={ratingText}
                        onChange={onRatingChange}
                        onBlur={onRatingBlur}
                        aria-invalid={Boolean(visibleErrors.rating) || undefined}
                        aria-describedby={describedBy}
                        className="field pr-14"
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                        / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={rating ?? 0}
                      onChange={(e) => setRatingText(formatRating(Number(e.target.value)))}
                      aria-label="Rating slider"
                      className="mt-3 w-full accent-ink"
                    />
                  </>
                ) : past.loading && !past.data ? (
                  <p className="text-sm text-muted">Loading your ratings…</p>
                ) : past.error ? (
                  <p className="text-sm text-danger">Couldn&rsquo;t load your ratings: {past.error.message}</p>
                ) : !comparisonUnlocked ? (
                  <div role="status" className="border border-line bg-card p-4 text-sm leading-relaxed">
                    <p className="font-medium">Rating by comparison unlocks at {COMPARISON_UNLOCK} ratings.</p>
                    <p className="mt-1 text-muted">
                      You&rsquo;ve rated {ratingCount} {ratingCount === 1 ? "album" : "albums"} so far. Score{" "}
                      {COMPARISON_UNLOCK - ratingCount} more with &ldquo;Score it&rdquo; and this option will rank new
                      albums against the ones you&rsquo;ve already rated.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMethod("manual")}
                      className="mt-3 text-xs font-medium underline underline-offset-4"
                    >
                      Score it instead
                    </button>
                  </div>
                ) : !album ? (
                  <p className="border border-line bg-card p-4 text-sm text-muted">
                    Pick the album above first, then compare it with your past ratings.
                  </p>
                ) : (
                  <ComparisonRater
                    key={`${album.title}|${album.artist}|${album.coverUrl}`}
                    album={album}
                    pastRatings={past.data ?? []}
                    onScore={setComparisonScore}
                  />
                )}
              </>
            )}
          </Field>

          <Field label="Short review" htmlFor="review" error={visibleErrors.review} className="mt-6">
            {(describedBy) => (
              <>
                <textarea
                  id="review"
                  rows={5}
                  maxLength={REVIEW_MAX_LENGTH}
                  placeholder={`${REVIEW_MAX_LENGTH} character maximum`}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  aria-describedby={describedBy}
                  className="field h-auto resize-y py-3 leading-relaxed"
                />
                <p
                  className={`mt-1 text-right text-xs tabular-nums ${
                    review.length >= REVIEW_MAX_LENGTH ? "text-ink" : "text-muted"
                  }`}
                  aria-live="polite"
                >
                  {review.length}/{REVIEW_MAX_LENGTH}
                </p>
              </>
            )}
          </Field>

          {submitError && (
            <p role="alert" className="mt-6 border border-danger/40 bg-card px-4 py-3 text-xs text-danger">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="eyebrow mt-6 flex h-[58px] w-full items-center justify-between bg-ink px-5 text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Continue to timeline"}
            <ArrowRightIcon size={16} />
          </button>
          <p className="mt-4 text-center text-[11px] text-muted">
            Your review will appear on{" "}
            <Link to={`/u/${user.handle}`} className="underline underline-offset-2">
              your profile
            </Link>{" "}
            and the timeline.
          </p>
        </form>
      </section>
    </div>
  );
}

function ModeButton({
  id,
  active,
  onClick,
  children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`px-3 py-2 text-xs font-semibold transition-colors ${active ? "bg-ink text-paper" : "text-ink hover:bg-field"}`}
    >
      {children}
    </button>
  );
}
