import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { Field } from "../components/FormField";
import { ArrowRightIcon } from "../components/Icons";
import { signIn } from "../lib/api";

export function LoginPage() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      // The session listener redirects once the profile has loaded.
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={
        <>
          Rate what
          <br />
          you&rsquo;re hearing.
        </>
      }
      subtitle="Log albums on a 10-point scale, rank them against each other, and see what your friends are spinning."
    >
      <form noValidate onSubmit={onSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h2 className="mt-3 font-serif text-[2.4rem] leading-tight tracking-tight">Sign in</h2>

        <Field label="Email" htmlFor="email" className="mt-12">
          {(describedBy) => (
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={describedBy}
              className="field"
            />
          )}
        </Field>
        <Field label="Password" htmlFor="password" className="mt-6">
          {(describedBy) => (
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {submitting ? "Signing in…" : "Sign in"}
          <ArrowRightIcon size={16} />
        </button>
        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link to="/signup" state={location.state} className="font-medium text-ink underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
