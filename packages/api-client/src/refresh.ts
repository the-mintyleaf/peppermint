import { readCookie, readStorage } from "./storage";
import type { AuthFailureInfo, RefreshMode } from "./types";

/** Everything the refresh POST needs, resolved once from the client config. */
export interface RefreshTransport {
  url: string;
  mode: RefreshMode;
  withCredentials: boolean;
  refreshTokenKey: string;
  csrfCookieName: string;
  csrfHeaderName: string;
  accessResponseField: string;
  expiresAtResponseField: string;
}

/**
 * The result of one refresh attempt.
 * - `ok`: new tokens (`refresh` is `null` when none was issued in the body — a
 *   cookie transport, or a concurrent-refresh grace answer).
 * - `rejected`: a JSON auth refusal — the credential is unusable, the session is over.
 * - `unavailable`: anything else (rate limit, 5xx, network, proxy/portal answers) —
 *   the session may be intact, so the caller must not sign the user out.
 */
export type RefreshOutcome =
  | {
      kind: "ok";
      access: string;
      refresh: string | null;
      expiresAt: string | null;
    }
  | { kind: "rejected"; info: AuthFailureInfo }
  | { kind: "unavailable"; rateLimited: boolean; retryAfterMs: number | null };

const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" ? (value as JsonObject) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

/** `null` when body mode has no stored refresh token (there is nothing to send). */
function buildRefreshInit(t: RefreshTransport): RequestInit | null {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (t.mode === "cookie") {
    const csrf = readCookie(t.csrfCookieName);
    if (csrf) headers[t.csrfHeaderName] = csrf;
    return { method: "POST", headers, credentials: "include" };
  }

  const stored = readStorage(t.refreshTokenKey);
  if (t.mode === "body" && !stored) return null;

  return {
    method: "POST",
    headers,
    body: JSON.stringify(stored ? { refresh: stored } : {}),
    ...(t.withCredentials ? { credentials: "include" as const } : {}),
  };
}

async function readJson(res: Response): Promise<JsonObject | null> {
  try {
    return asObject(await res.json());
  } catch {
    return null;
  }
}

/** `{ success: false, error: { code, details: { reason } } }` → failure info. */
function failureInfo(status: number, payload: JsonObject | null) {
  const error = asObject(payload?.error);
  const details = asObject(error?.details);
  return {
    status,
    code: asString(error?.code),
    reason: asString(details?.reason),
  } satisfies AuthFailureInfo;
}

/** Seconds or HTTP-date `Retry-After` → ms (only readable if CORS exposes it). */
function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

/**
 * Accept the nested envelope `{ data: { <field>, … } }` only when it carries a token;
 * otherwise fall back to a flat `{ <field>, … }`.
 */
function tokensFrom(payload: JsonObject | null, t: RefreshTransport) {
  const nested = asObject(payload?.data);
  const tokens =
    nested && asString(nested[t.accessResponseField]) ? nested : payload;
  return {
    access: asString(tokens?.[t.accessResponseField]),
    refresh: asString(tokens?.refresh),
    expiresAt: asString(tokens?.[t.expiresAtResponseField]),
  };
}

/**
 * A definitive refusal is a JSON auth error from the refresh endpoint itself: a 401
 * with an error code, or a 403 with an `AUTH_*` code. Anything else (408, a proxy or
 * WAF 403/404/405, a captive-portal HTML page) says nothing about the session.
 */
function isAuthRefusal(status: number, info: AuthFailureInfo): boolean {
  if (!info.code) return false;
  return status === 401 || (status === 403 && info.code.startsWith("AUTH_"));
}

const UNAVAILABLE = {
  kind: "unavailable",
  rateLimited: false,
  retryAfterMs: null,
} as const satisfies RefreshOutcome;

/** One refresh POST, classified. Uses raw `fetch` so no interceptor can recurse. */
export async function sendRefresh(
  t: RefreshTransport,
): Promise<RefreshOutcome> {
  const init = buildRefreshInit(t);
  if (!init) {
    return {
      kind: "rejected",
      info: { status: null, code: null, reason: "missing" },
    };
  }

  let res: Response;
  try {
    res = await fetch(t.url, init);
  } catch {
    return UNAVAILABLE;
  }

  if (res.status === 429) {
    const retryAfterMs = parseRetryAfter(res.headers.get("Retry-After"));
    return { kind: "unavailable", rateLimited: true, retryAfterMs };
  }

  const payload = await readJson(res);
  if (!res.ok) {
    const info = failureInfo(res.status, payload);
    return isAuthRefusal(res.status, info)
      ? { kind: "rejected", info }
      : UNAVAILABLE;
  }

  // A 2xx that isn't a token answer (non-JSON, captive portal) is not a refusal.
  const { access, refresh, expiresAt } = tokensFrom(payload, t);
  return access ? { kind: "ok", access, refresh, expiresAt } : UNAVAILABLE;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * {@link sendRefresh}, retrying a rate-limited (429) answer with exponential backoff
 * (honouring `Retry-After` when readable, never less than 1 s). A 429 means the
 * session is intact, so an exhausted retry budget still comes back `unavailable`,
 * never `rejected`. `onRateLimited` fires on the first 429 so a waiting request can
 * fail fast while the retries continue in the background.
 */
export async function sendRefreshWithBackoff(
  t: RefreshTransport,
  maxRateLimitRetries: number,
  onRateLimited?: (outcome: RefreshOutcome) => void,
): Promise<RefreshOutcome> {
  let outcome = await sendRefresh(t);
  for (
    let attempt = 0;
    attempt < maxRateLimitRetries &&
    outcome.kind === "unavailable" &&
    outcome.rateLimited;
    attempt++
  ) {
    onRateLimited?.(outcome);
    const backoff = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
    const wait = outcome.retryAfterMs ?? backoff;
    await sleep(Math.min(Math.max(wait, MIN_BACKOFF_MS), MAX_BACKOFF_MS));
    outcome = await sendRefresh(t);
  }
  return outcome;
}
