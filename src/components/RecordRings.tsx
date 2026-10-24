import { useId } from "react";

/** The concentric "record" from the mockup; a cover, when given, becomes the spinning label. */
export function RecordRings({ coverUrl = null, className = "" }: { coverUrl?: string | null; className?: string }) {
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
