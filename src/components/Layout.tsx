import { Link, NavLink, Outlet, ScrollRestoration } from "react-router";
import { useSession } from "../context/SessionContext";
import { Avatar } from "./Avatar";
import { PlusIcon } from "./Icons";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `eyebrow border-b-2 py-1 transition-colors ${
    isActive ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
  }`;

export function Layout() {
  const { user } = useSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:h-[88px] sm:gap-8 sm:px-10">
          <Link to="/" className="font-serif text-2xl tracking-tight sm:text-[1.75rem]">
            Music Rater
          </Link>

          <nav aria-label="Primary" className="ml-auto flex items-center gap-4 sm:gap-8">
            <NavLink to="/" end className={navClass}>
              Timeline
            </NavLink>
            <NavLink to="/rate" className={navClass}>
              Rate
            </NavLink>
            <NavLink to="/profile" className={navClass}>
              Profile
            </NavLink>
          </nav>

          <Link
            to="/rate"
            className="eyebrow hidden items-center gap-2 bg-ink px-4 py-3 text-paper transition-opacity hover:opacity-85 md:flex"
          >
            <PlusIcon size={14} strokeWidth={2.2} />
            New rating
          </Link>
          {user && (
            <Link to={`/u/${user.handle}`} aria-label="Your profile" className="hidden sm:block">
              <Avatar profile={user} size={36} />
            </Link>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <ScrollRestoration />
    </div>
  );
}
