import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Typed Supabase client, or `null` until VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY are set in .env.local. The data layer (src/lib/api.ts)
 * falls back to mock data while this is null, so the UI works without a backend.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Storage bucket for user-uploaded album covers (see supabase/schema.sql). */
export const COVER_BUCKET = "album-covers";
