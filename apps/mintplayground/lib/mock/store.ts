import { MOCK_ACCOUNTS, type MockAccount } from "./accounts";
import type { CurrentUser } from "@/modules/auth/_shared/auth.types";

/**
 * Mutable server-side state for the mock auth API. Route handlers in a single
 * Next dev server share this module instance, so a password change or a cleared
 * `password_change_required` flag survives navigation — but not a server
 * restart. That is the intended lifetime: a playground resets clean.
 */

/** Live account state, seeded from the static definitions on first import. */
const accounts = new Map<string, MockAccount>(
  Object.entries(MOCK_ACCOUNTS).map(([username, account]) => [
    username,
    { ...account, profile: { ...account.profile } },
  ]),
);

/** Open MFA challenges, keyed by the id handed to the client. */
const challenges = new Map<string, { username: string; expiresAt: number }>();

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export function getAccount(username: string): MockAccount | undefined {
  return accounts.get(username.trim().toLowerCase());
}

export function verifyCredentials(
  username: string,
  password: string,
): MockAccount | null {
  const account = getAccount(username);
  if (!account || account.password !== password) return null;
  return account;
}

export function setPassword(username: string, password: string): void {
  const account = getAccount(username);
  if (!account) return;
  account.password = password;
  // A completed change satisfies the forced-change gate.
  account.profile.password_change_required = false;
}

export function touchLastLogin(username: string): void {
  const account = getAccount(username);
  if (!account) return;
  account.profile.last_login = new Date().toISOString();
}

export function getProfile(username: string): CurrentUser | null {
  return getAccount(username)?.profile ?? null;
}

/* ── MFA challenges ───────────────────────────────────────────────────────── */

export function createChallenge(username: string): string {
  const id = `chl_${Math.random().toString(36).slice(2, 12)}`;
  challenges.set(id, { username, expiresAt: Date.now() + CHALLENGE_TTL_MS });
  return id;
}

/**
 * Look up a challenge WITHOUT spending it. Returns the username on a live
 * challenge, `"expired"` when it timed out, or `null` when the id was never
 * issued — the caller maps each to a different error code. A wrong code must
 * leave the challenge intact so the user can retry on the same id.
 */
export function peekChallenge(id: string): string | "expired" | null {
  const challenge = challenges.get(id);
  if (!challenge) return null;
  if (challenge.expiresAt < Date.now()) {
    challenges.delete(id);
    return "expired";
  }
  return challenge.username;
}

/** Spend a challenge once its code has been accepted. */
export function consumeChallenge(id: string): void {
  challenges.delete(id);
}
