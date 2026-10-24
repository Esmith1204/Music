import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { Field } from "../components/FormField";
import { HandleInput, ProfileNameInput } from "../components/ProfileFields";
import { ArrowRightIcon } from "../components/Icons";
import { useHandleCheck } from "../hooks/useHandleCheck";
import { signUp } from "../lib/api";

const MIN_PASSWORD = 6;

export function SignUpPage() {
  const location = useLocation();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmailFor, setConfirmEmailFor] = useState<string | null>(null);
  const handleCheck = useHandleCheck(handle);

  const errors = {
    displayName: displayName.trim() ? null : "Enter your name.",
    handle:
      handleCheck.status === "empty"
        ? "Pick a handle."
        : handleCheck.status === "invalid" || handleCheck.status === "taken"
          ? handleCheck.message
          : null,
    email: /^\S+@\S+\.\S+$/.test(email.trim()) ? null : "Enter a valid email.",
    password: password.length >= MIN_PASSWORD ? null : `Use at least ${MIN_PASSWORD} characters.`,
  };
  const shown = (key: keyof typeof errors) => (attempted ? errors[key] : null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.values(errors).some(Boolean) || handleCheck.status === "checking") return;
    setSubmitting(true);
    setError(null);
    try {
      const { needsEmailConfirmation } = await signUp({ email, password, handle, displayName });
      if (needsEmailConfirmation) setConfirmEmailFor(email.trim());
      // Otherwise the new session signs them in and the route guard redirects.
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const title = (
    <>
      Start your
      <br />
      record.
    </>
  );
  const subtitle = "Make a profile to log ratings, build your rankings, and add friends.";

  if (confirmEmailFor) {
    return (
      <AuthLayout title={title} subtitle={subtitle}>
        <p className="eyebrow">Almost there</p>
        <h2 className="mt-3 font-serif text-[2.4rem] leading-tight tracking-tight">Check your email</h2>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          We sent a confirmation link to <span className="font-medium text-ink">{confirmEmailFor}</span>. Open it to
          activate your account, then sign in.
        </p>
        <Link
          to="/login"
          className="eyebrow mt-8 flex h-[58px] w-full items-center justify-between bg-ink px-5 text-paper"
        >
          Go to sign in
          <ArrowRightIcon size={16} />
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <form noValidate onSubmit={onSubmit}>
        <p className="eyebrow">Create an account</p>
        <h2 className="mt-3 font-serif text-[2.4rem] leading-tight tracking-tight">Join Music Rater</h2>

        <ProfileNameInput value={displayName} onChange={setDisplayName} error={shown("displayName")} className="mt-12" />
        <HandleInput value={handle} onChange={setHandle} check={handleCheck} error={shown("handle")} className="mt-6" />

        <Field label="Email" htmlFor="email" error={shown("email")} className="mt-6">
          {(describedBy) => (
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(shown("email")) || undefined}
              aria-describedby={describedBy}
              className="field"
            />
          )}
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={shown("password")}
          hint={`At least ${MIN_PASSWORD} characters.`}
          className="mt-6"
        >
          {(describedBy) => (
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(shown("password")) || undefined}
              aria-describedby={describedBy}
              className="field"
            />
          )}
        </Field>

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
          {submitting ? "Creating account…" : "Create account"}
          <ArrowRightIcon size={16} />
        </button>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="font-medium text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
