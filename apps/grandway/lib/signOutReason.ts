import type { AuthFailureInfo } from "@peppermint/api-client";

/** Query parameter on the sign-in route (`/`) naming why the session ended. */
export const SIGNED_OUT_PARAM = "signed_out";

/** Reason slug for `AUTH_REFRESH_REUSED`, which carries no `details.reason`. */
export const REUSED_REASON = "reused";

/**
 * A failed refresh → the reason slug carried to the sign-in page. Uses
 * `error.details.reason` (`authenticate/INTEGRATION.md` §5) when present, maps
 * `AUTH_REFRESH_REUSED` to `"reused"`, and returns `null` when nothing is known.
 * Only `[a-z_]` survives, so the slug is safe to put in a URL and to look up.
 */
export function signOutReasonFrom(info: AuthFailureInfo): string | null {
  const raw =
    info.reason ?? (info.code === "AUTH_REFRESH_REUSED" ? REUSED_REASON : null);
  return raw && /^[a-z_]{1,64}$/.test(raw) ? raw : null;
}

/** The sign-in URL to land on after a failed refresh. */
export function signInUrlFor(info: AuthFailureInfo): string {
  const reason = signOutReasonFrom(info);
  return reason
    ? `/?${SIGNED_OUT_PARAM}=${encodeURIComponent(reason)}`
    : `/?${SIGNED_OUT_PARAM}=1`;
}
