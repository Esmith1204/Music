import { useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { AlbumCover } from "../components/AlbumCover";
import { AlbumSearchField } from "../components/AlbumSearchField";
import { ArrowRightIcon, UploadIcon } from "../components/Icons";
import { saveRating } from "../lib/api";
import {
  fileToCoverDataUrl,
  formatRating,
  parseRating,
  RATING_PARTIAL_PATTERN,
  REVIEW_MAX_LENGTH,
} from "../lib/format";
import type { AlbumSearchResult } from "../lib/itunes";

// No accounts yet: every rating is saved under this placeholder user.
// Swap for the signed-in user's id once Supabase auth is added.
const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000001";

interface FieldErrors {
  album?: string;
  rating?: string;
  review?: string;
}

export function CreateRatingPage() {
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [userId] = useState(DUMMY_USER_ID);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AlbumSearchResult | null>(null);
  const [uploadedCover, setUploadedCover] = useState<string | null>(null);
  const [ratingText, setRatingText] = useState("");
  const [review, setReview] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const coverUrl = uploadedCover ?? selected?.coverUrl ?? null;
  const albumTitle = selected?.title ?? query.trim();
  const rating = parseRating(ratingText);
  const errors = validate();
  const visibleErrors: FieldErrors = attempted ? errors : {};

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!albumTitle) e.album = "Enter the album you listened to.";
    else if (!coverUrl) e.album = "Pick an album from the search results or upload its cover.";
    if (rating === null) e.rating = "Use a score from 0.0 to 10.0 with at most one decimal (e.g. 8.5).";
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
    } catch (err) {
      setUploadError((err as Error).message);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.keys(errors).length > 0 || rating === null || !coverUrl) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const post = await saveRating(userId, {
        album: {
          title: albumTitle,
          artist: selected?.artist ?? null,
          year: selected?.year ?? null,
          coverUrl,
        },
        rating,
        review: review.trim(),
      });
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
                  }}
                  onSelect={(album) => {
                    setSelected(album);
                    setQuery(album.title);
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

          <Field label="Your rating" htmlFor="rating" error={visibleErrors.rating} className="mt-7">
            {(describedBy) => (
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
          <p className="mt-4 text-center text-[11px] text-muted">Your review will be visible to everyone.</p>
        </form>
      </section>
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: (describedBy: string | undefined) => ReactNode;
}

function Field({ label, htmlFor, error, className = "", children }: FieldProps) {
  const errorId = useId();
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2.5 block text-xs font-semibold tracking-wide">
        {label}
      </label>
      {children(error ? errorId : undefined)}
      {error && (
        <p id={errorId} className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** The concentric "record" from the mockup; the chosen cover becomes the spinning label. */
function RecordRings({ coverUrl, className = "" }: { coverUrl: string | null; className?: string }) {
  const clipId = useId();
  return (
    <svg viewBox="0 0 600 600" aria-hidden="true" className={className}>
      <g fill="none" stroke="var(--color-line)" strokeWidth="1.2">
        <circle cx="300" cy="300" r="292" />
        <circle cx="300" cy="300" r="228" />
        <circle cx="300" cy="300" r="142" />
      </g>
      {coverUrl ? (
        <g className="origin-center motion-safe:animate-[spin_14s_linear_infinite]" style={{ transformBox: "fill-box" }}>
          <clipPath id={clipId}>
            <circle cx="300" cy="300" r="140" />
          </clipPath>
          <image
            href={coverUrl}
            x="160"
            y="160"
            width="280"
            height="280"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
          <circle cx="300" cy="300" r="9" fill="var(--color-paper)" stroke="var(--color-rule)" />
        </g>
      ) : (
        <circle cx="300" cy="300" r="38" fill="none" stroke="var(--color-rule)" strokeWidth="1.2" />
      )}
    </svg>
  );
}
