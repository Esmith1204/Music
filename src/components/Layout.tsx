import { useState } from "react";
import { Link, NavLink, Outlet, ScrollRestoration } from "react-router";
import { useCurrentUser } from "../context/SessionContext";
import { signOut } from "../lib/api";
import { Avatar } from "./Avatar";
import { PlusIcon } from "./Icons";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `eyebrow border-b-2 py-1 transition-colors max-sm:tracking-[0.12em] ${
    isActive ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
  }`;

export function Layout() {
  const user = useCurrentUser();
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:h-[88px] sm:gap-8 sm:px-10">
          <Link to="/" aria-label="Music Rater home" className="shrink-0 font-serif text-2xl tracking-tight sm:text-[1.75rem]">
            <span className="hidden sm:inline">Music Rater</span>
            <img src="/favicon.svg" alt="" className="size-8 sm:hidden" />
          </Link>

          <nav aria-label="Primary" className="ml-auto flex items-center gap-3.5 sm:gap-8">
            <NavLink to="/" end className={navClass}>
              Timeline
            </NavLink>
            <NavLink to="/rate" className={navClass}>
              Rate
            </NavLink>
            <NavLink to="/people" className={navClass}>
              People
            </NavLink>
            <NavLink to={`/u/${user.handle}`} className={navClass}>
              Profile
            </NavLink>
          </nav>

          <Link
            to="/rate"
            className="eyebrow hidden items-center gap-2 bg-ink px-4 py-3 text-paper transition-opacity hover:opacity-85 lg:flex"
          >
            <PlusIcon size={14} strokeWidth={2.2} />
            New rating
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <Link to={`/u/${user.handle}`} aria-label="Your profile">
              <Avatar profile={user} size={36} />
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              disabled={signingOut}
              className="text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline disabled:opacity-60"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <ScrollRestoration />
    </div>
  );
}
