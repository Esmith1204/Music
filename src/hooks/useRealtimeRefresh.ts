import { useEffect, useId, useRef } from "react";
import { supabase } from "../lib/supabase";

type Table = "ratings" | "friendships" | "profiles";

/**
 * Calls `onChange` (debounced) whenever a row in any of `tables` is inserted,
 * updated, or deleted, using Supabase Realtime. Requires the tables to be in the
 * `supabase_realtime` publication (done in migration 002).
 */
export function useRealtimeRefresh(tables: Table[], onChange: () => void) {
  const channelId = useId();
  const callback = useRef(onChange);
  callback.current = onChange;
  const tableKey = tables.join(",");

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let timer: number | undefined;
    const fire = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback.current(), 300);
    };
    const channel = client.channel(`refresh${channelId}`);
    for (const table of tableKey.split(",")) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, fire);
    }
    channel.subscribe();
    return () => {
      window.clearTimeout(timer);
      void client.removeChannel(channel);
    };
  }, [channelId, tableKey]);
}
