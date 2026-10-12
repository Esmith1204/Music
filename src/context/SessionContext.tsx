import { createContext, useContext, type ReactNode } from "react";
import { getCurrentUser } from "../lib/api";
import { useAsync } from "../hooks/useAsync";
import type { Profile } from "../types";

// Holds the signed-in user. Today it resolves the mock user; when Supabase auth
// is added, load the profile from supabase.auth.getSession() here and subscribe
// to supabase.auth.onAuthStateChange.

interface Session {
  user: Profile | null;
  loading: boolean;
}

const SessionContext = createContext<Session>({ user: null, loading: true });

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data, loading } = useAsync(getCurrentUser, []);
  return (
    <SessionContext.Provider value={{ user: data ?? null, loading }}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
