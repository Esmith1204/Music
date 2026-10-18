import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

// Vite inlines these at build time: on Vercel, redeploy after changing them.
// The key may use Supabase's current name (PUBLISHABLE_KEY) or the legacy one (ANON_KEY).
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const publicKey = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
)?.trim();

export const isSupabaseConfigured = Boolean(url && publicKey);

/** Env vars that were missing from this build, for error messages. */
export const missingSupabaseEnv = [
  !url && "VITE_SUPABASE_URL",
  !publicKey && "VITE_SUPABASE_PUBLISHABLE_KEY",
].filter((name): name is string => Boolean(name));

/**
 * Typed Supabase client, or `null` until VITE_SUPABASE_URL and
 * VITE_SUPABASE_PUBLISHABLE_KEY are set (.env.local locally, Vercel env vars in
 * production). The rating page reports an error while this is null.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, publicKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Storage bucket for user-uploaded album covers (see supabase/schema.sql). */
export const COVER_BUCKET = "album-covers";
