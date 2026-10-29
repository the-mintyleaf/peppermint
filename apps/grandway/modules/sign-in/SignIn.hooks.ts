"use client";

import { useEffect, useSyncExternalStore } from "react";

import { SIGNED_OUT_PARAM } from "@/lib/signOutReason";

import { signOutMessage } from "./SignIn.utils";

/**
 * Captured once per page load: the param is stripped from the URL right after, so a
 * later read would come back empty and the notice would vanish on re-render. A forced
 * sign-out always arrives via a full navigation, which resets this.
 */
let capturedReason: string | null | undefined;

function readReason(): string | null {
  if (capturedReason === undefined) {
    capturedReason = new URLSearchParams(window.location.search).get(
      SIGNED_OUT_PARAM,
    );
  }
  return capturedReason;
}

const noopSubscribe = () => () => {};
const serverReason = () => null;

/**
 * Why the user was sent here, from `?signed_out=<reason>` (set by `lib/api.ts` when a
 * refresh is refused) — as plain words, or `null` for a normal visit. Read without
 * `useSearchParams` so the `/` route needs no Suspense boundary; the param is then
 * removed so a reload or a bookmark doesn't repeat a stale notice.
 */
export function useSignOutNotice(): string | null {
  const reason = useSyncExternalStore(noopSubscribe, readReason, serverReason);

  useEffect(() => {
    if (!reason) return;
    const url = new URL(window.location.href);
    url.searchParams.delete(SIGNED_OUT_PARAM);
    window.history.replaceState(window.history.state, "", url);
  }, [reason]);

  return reason ? signOutMessage(reason) : null;
}
