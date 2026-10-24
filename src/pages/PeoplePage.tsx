import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Avatar } from "../components/Avatar";
import { CheckIcon, PlusIcon } from "../components/Icons";
import { useCurrentUser } from "../context/SessionContext";
import { useAsync } from "../hooks/useAsync";
import { listFriends, searchProfiles, setFollowing } from "../lib/api";
import type { Profile } from "../types";

/** /people — find other listeners and add them as friends. */
export function PeoplePage() {
  const viewer = useCurrentUser();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const results = useAsync(() => searchProfiles(debounced), [debounced]);
  const friends = useAsync(() => listFriends(viewer.id), [viewer.id]);
  const friendIds = new Set(friends.data?.map((f) => f.id));
  const people = results.data?.filter((p) => p.id !== viewer.id);

  return (
    <div className="mx-auto w-full max-w-[56rem] px-4 pb-24 pt-8 sm:pt-20">
      <p className="eyebrow">People</p>
      <h1 className="mt-3 font-serif text-[2.6rem] leading-tight tracking-tight">Find your friends</h1>

      <label htmlFor="people-search" className="sr-only">
        Search by name or handle
      </label>
      <input
        id="people-search"
        type="search"
        autoComplete="off"
        placeholder="Search by name or @handle"
        value={query}
        onChange={(e) => setQuery(e.target.value.replace(/^@/, ""))}
        className="field mt-8"
      />

      {results.error ? (
        <p className="mt-8 text-sm text-danger">{results.error.message}</p>
      ) : !people ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : people.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          {debounced ? `No one matches “${debounced}”.` : "No one else has joined yet. Share the site with a friend!"}
        </p>
      ) : (
        <>
          {!debounced && <p className="eyebrow mt-10 text-muted">Newest members</p>}
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {people.map((person) => (
              <PersonRow
                key={person.id}
                person={person}
                viewerId={viewer.id}
                isFriend={friendIds.has(person.id)}
                onChange={friends.reload}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

interface PersonRowProps {
  person: Profile;
  viewerId: string;
  isFriend: boolean;
  onChange: () => void;
}

function PersonRow({ person, viewerId, isFriend, onChange }: PersonRowProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setPending(true);
    setError(null);
    try {
      await setFollowing(viewerId, person.id, !isFriend);
      onChange();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <li className="flex items-center gap-4 py-4">
      <Link to={`/u/${person.handle}`} className="group flex min-w-0 flex-1 items-center gap-4">
        <Avatar profile={person} size={48} />
        <span className="min-w-0">
          <span className="block truncate font-medium group-hover:underline">{person.displayName}</span>
          <span className="block truncate text-sm text-muted">@{person.handle}</span>
          {person.bio && <span className="mt-0.5 block truncate text-sm">{person.bio}</span>}
        </span>
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-pressed={isFriend}
          className={`eyebrow flex h-10 items-center gap-2 px-4 transition-opacity disabled:opacity-60 ${
            isFriend ? "border border-ink" : "bg-ink text-paper hover:opacity-90"
          }`}
        >
          {isFriend ? <CheckIcon size={13} strokeWidth={2.2} /> : <PlusIcon size={13} strokeWidth={2.2} />}
          {isFriend ? "Friends" : "Add friend"}
        </button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </li>
  );
}
