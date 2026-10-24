import { useEffect, useState } from "react";
import { isHandleAvailable } from "../lib/api";
import { handleError } from "../lib/format";

export type HandleStatus = "empty" | "invalid" | "checking" | "available" | "taken" | "unknown";

/** Validates a handle locally, then (debounced) asks the database whether it's free. */
export function useHandleCheck(handle: string): { status: HandleStatus; message: string | null } {
  const [remote, setRemote] = useState<{ handle: string; status: HandleStatus } | null>(null);
  const localError = handle ? handleError(handle) : null;

  useEffect(() => {
    if (!handle || localError) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      isHandleAvailable(handle).then(
        (free) => !cancelled && setRemote({ handle, status: free ? "available" : "taken" }),
        // If the check fails, let sign-up try; the database still enforces uniqueness.
        () => !cancelled && setRemote({ handle, status: "unknown" }),
      );
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [handle, localError]);

  if (!handle) return { status: "empty", message: null };
  if (localError) return { status: "invalid", message: localError };
  if (remote?.handle !== handle) return { status: "checking", message: "Checking…" };
  if (remote.status === "taken") return { status: "taken", message: `@${handle} is taken.` };
  if (remote.status === "available") return { status: "available", message: `@${handle} is available.` };
  return { status: "unknown", message: null };
}
