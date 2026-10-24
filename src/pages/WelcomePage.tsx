import { useState, type FormEvent } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { HandleInput, ProfileNameInput } from "../components/ProfileFields";
import { ArrowRightIcon } from "../components/Icons";
import { useSession } from "../context/SessionContext";
import { useHandleCheck } from "../hooks/useHandleCheck";
import { createProfile, signOut } from "../lib/api";

/** Shown to signed-in accounts that don't have a profile row yet. */
export function WelcomePage() {
  const { userId, email, refreshProfile, error: sessionError } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(sessionError);
  const handleCheck = useHandleCheck(handle);

  const nameError = displayName.trim() ? null : "Enter your name.";
  const handleError =
    handleCheck.status === "empty"
      ? "Pick a handle."
      : handleCheck.status === "invalid" || handleCheck.status === "taken"
        ? handleCheck.message
        : null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!userId || nameError || handleError || handleCheck.status === "checking") return;
    setSubmitting(true);
    setError(null);
    try {
      await createProfile(userId, handle, displayName);
      await refreshProfile();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={
        <>
          One last
          <br />
          thing.
        </>
      }
      subtitle="Pick the name and handle people will see on your ratings."
    >
      <form noValidate onSubmit={onSubmit}>
        <p className="eyebrow">Set up your profile</p>
        <h2 className="mt-3 font-serif text-[2.4rem] leading-tight tracking-tight">Who&rsquo;s listening?</h2>
        {email && <p className="mt-2 text-sm text-muted">Signed in as {email}</p>}

        <ProfileNameInput
          value={displayName}
          onChange={setDisplayName}
          error={attempted ? nameError : null}
          className="mt-10"
        />
        <HandleInput
          value={handle}
          onChange={setHandle}
          check={handleCheck}
          error={attempted ? handleError : null}
          className="mt-6"
        />

        {error && (
          <p role="alert" className="mt-6 border border-danger/40 bg-card px-4 py-3 text-xs text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="eyebrow mt-8 flex h-[58px] w-full items-center justify-between bg-ink px-5 text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Continue"}
          <ArrowRightIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-6 w-full text-center text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </AuthLayout>
  );
}
