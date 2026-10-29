import { REUSED_REASON } from "@/lib/signOutReason";

/**
 * Plain-words explanation per refresh-failure reason — `AUTH_REFRESH_INVALID`
 * `error.details.reason` (`authenticate/INTEGRATION.md` §5) plus `"reused"` for
 * `AUTH_REFRESH_REUSED`. Shown on the sign-in page after a forced sign-out.
 */
const SIGN_OUT_MESSAGES: Record<string, string> = {
  missing:
    "You were signed out because this browser no longer had your sign-in. This can happen when cookies are cleared or blocked.",
  not_found:
    "You were signed out because your session could not be found. Please sign in again.",
  expired:
    "You were signed out because your session expired — after 12 hours without activity, or 7 days after you signed in.",
  blocked:
    "You were signed out because your account has been blocked. Contact your administrator.",
  logout:
    "You were signed out because this session was signed out, for example in another tab.",
  password_change:
    "You were signed out because your password was changed. Sign in with your new password.",
  replaced_same_device:
    "You were signed out because this account signed in again on this device.",
  rotated_reuse:
    "You were signed out to protect your account, because your sign-in was used from somewhere else.",
  admin_revoked: "You were signed out by an administrator.",
  mfa_change:
    "You were signed out because your two-step verification settings changed.",
  device_limit:
    "You were signed out because this account signed in on too many devices.",
  [REUSED_REASON]:
    "You were signed out to protect your account, because an old sign-in was used again.",
};

const FALLBACK_MESSAGE =
  "Your session ended, so you were signed out. Please sign in again.";

/** The message for a `?signed_out=` value; unknown values get a generic line. */
export function signOutMessage(reason: string): string {
  return Object.hasOwn(SIGN_OUT_MESSAGES, reason)
    ? SIGN_OUT_MESSAGES[reason]
    : FALLBACK_MESSAGE;
}
