import { sendRefreshWithBackoff } from "./refresh";
import type { RefreshOutcome, RefreshTransport } from "./refresh";
import { readStorage, removeStorage, writeStorage } from "./storage";
import type { AuthFailureInfo } from "./types";

export interface RefreshSessionOptions {
  transport: RefreshTransport;
  accessTokenKey: string;
  refreshTokenKey: string;
  accessExpiresAtKey: string;
  proactive: boolean;
  leadTimeMs: number;
  maxRateLimitRetries: number;
  onAuthFailure: (info: AuthFailureInfo) => void;
}

/**
 * {@link RefreshOutcome}, plus `signed_out`: there is no stored access token (the
 * user signed out, or a refusal already ended the session), so nothing was — or will
 * be — refreshed or written.
 */
export type SessionRefreshOutcome = RefreshOutcome | { kind: "signed_out" };

export interface RefreshOptions {
  /**
   * Resolve as soon as the refresh is rate-limited instead of waiting out the whole
   * backoff; the retries continue in the background. For a waiting request.
   */
  failFast?: boolean;
}

export interface RefreshSession {
  /** Single-flight refresh: concurrent callers in this tab share one request. */
  refresh: (options?: RefreshOptions) => Promise<SessionRefreshOutcome>;
  /** (Re)schedule the proactive refresh from the stored expiry. Cheap; idempotent. */
  sync: () => void;
  /** The stored access token is past its stored expiry (and a refresh is allowed). */
  isAccessExpired: () => boolean;
}

/** Retry delay for a proactive refresh that came back `unavailable`. */
const UNAVAILABLE_RETRY_MS = 15_000;
/**
 * Floor between proactive refreshes across ALL tabs (the attempt time is shared in
 * storage). Guards against a refresh loop — and ping-pong between tabs — when the
 * client clock runs ahead of the server's and every fresh expiry looks past.
 */
const MIN_PROACTIVE_INTERVAL_MS = 30_000;
/** Cooldown after a refresh round ends `unavailable`; doubles per round, capped. */
const INITIAL_COOLDOWN_MS = 30_000;
const MAX_COOLDOWN_MS = 300_000;
/** Spread so several tabs don't all fire at the same instant. */
const MAX_JITTER_MS = 5_000;
/** A timer this late (throttled background tab, sleep) is fired immediately. */
const OVERDUE_SLACK_MS = 1_000;
const MAX_TIMEOUT_MS = 2_147_483_647;

const SIGNED_OUT = { kind: "signed_out" } as const;
const COOLING_DOWN = {
  kind: "unavailable",
  rateLimited: false,
  retryAfterMs: null,
} as const satisfies RefreshOutcome;

interface Flight {
  /** Settles with the final outcome. Never rejects. */
  final: Promise<SessionRefreshOutcome>;
  /** Settles on the first 429, or with the final outcome — whichever is first. */
  first: Promise<SessionRefreshOutcome>;
}

/**
 * Owns refresh state for one client instance: single-flight refresh, token
 * persistence, the auth-failure hand-off, cooldown, and the proactive timer.
 *
 * Multi-tab: every tab reads the same localStorage expiry and the same last-attempt
 * time. Whichever tab fires first records its attempt and writes the new token +
 * expiry; the others see it via the `storage` event (and a re-check when their own
 * timer fires) and reschedule instead of refreshing. If two tabs do refresh at once
 * the server's reuse grace window answers both.
 */
export function createRefreshSession(o: RefreshSessionOptions): RefreshSession {
  const attemptKey = `${o.accessTokenKey}_refresh_attempt_at`;

  let flight: Flight | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let scheduledFor: number | null = null;
  let timerDueAt = 0;
  /** The access token whose session already got `onAuthFailure` (at most once). */
  let failedToken: string | null = null;
  let cooldownUntil = 0;
  let cooldownMs = 0;
  let cooldownToken: string | null = null;

  const readAccess = () => readStorage(o.accessTokenKey);

  const readTime = (key: string): number | null => {
    const raw = readStorage(key);
    const ms = raw ? Date.parse(raw) : NaN;
    return Number.isNaN(ms) ? null : ms;
  };
  const readExpiry = () => readTime(o.accessExpiresAtKey);
  /** Earliest moment the next proactive refresh may start, from any tab. */
  const proactiveFloor = () =>
    (readTime(attemptKey) ?? 0) + MIN_PROACTIVE_INTERVAL_MS;

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    scheduledFor = null;
  };

  const startTimer = (dueAt: number, expiry: number | null) => {
    clearTimer();
    scheduledFor = expiry;
    timerDueAt = dueAt;
    const delay = Math.min(Math.max(0, dueAt - Date.now()), MAX_TIMEOUT_MS);
    timer = setTimeout(onTimer, delay);
  };

  const sync = () => {
    if (!o.proactive || typeof window === "undefined") return;
    const expiry = readExpiry();
    if (expiry === null || !readAccess()) {
      clearTimer();
      return;
    }
    const overdue = Date.now() > timerDueAt + OVERDUE_SLACK_MS;
    if (timer && scheduledFor === expiry && !overdue) return;
    const dueAt = Math.max(
      expiry - o.leadTimeMs - Math.random() * MAX_JITTER_MS,
      proactiveFloor(),
      cooldownUntil,
    );
    startTimer(dueAt, expiry);
  };

  const fireAuthFailure = (info: AuthFailureInfo, token: string) => {
    if (failedToken === token) return;
    failedToken = token;
    clearTimer();
    try {
      o.onAuthFailure(info);
    } catch (error) {
      console.error("[@peppermint/api-client] onAuthFailure threw", error);
    }
  };

  const enterCooldown = (token: string) => {
    cooldownMs = cooldownMs
      ? Math.min(cooldownMs * 2, MAX_COOLDOWN_MS)
      : INITIAL_COOLDOWN_MS;
    cooldownUntil = Date.now() + cooldownMs;
    cooldownToken = token;
  };

  const storeTokens = (outcome: Extract<RefreshOutcome, { kind: "ok" }>) => {
    writeStorage(o.accessTokenKey, outcome.access);
    if (outcome.expiresAt) {
      writeStorage(o.accessExpiresAtKey, outcome.expiresAt);
    } else {
      removeStorage(o.accessExpiresAtKey);
    }
    // A missing body refresh (cookie transport, or a grace-window answer) keeps
    // the newest one already held.
    if (o.transport.mode !== "cookie" && outcome.refresh) {
      writeStorage(o.refreshTokenKey, outcome.refresh);
    }
  };

  /**
   * Apply one finished flight that started with `startToken`. If the stored token
   * is gone, the user signed out meanwhile — never write a token back (that would
   * resurrect the session). If it changed, another tab or a new login superseded
   * this flight — don't overwrite it and don't sign that newer session out.
   */
  const applyOutcome = (
    outcome: RefreshOutcome,
    startToken: string,
  ): SessionRefreshOutcome => {
    const current = readAccess();
    if (!current) return SIGNED_OUT;
    const superseded = current !== startToken;

    if (outcome.kind === "ok") {
      failedToken = null;
      cooldownMs = 0;
      cooldownUntil = 0;
      if (!superseded) storeTokens(outcome);
      sync();
    } else if (outcome.kind === "rejected") {
      if (!superseded) fireAuthFailure(outcome.info, startToken);
    } else {
      enterCooldown(startToken);
    }
    return outcome;
  };

  const startFlight = (startToken: string): Flight => {
    writeStorage(attemptKey, new Date().toISOString());
    let settleFirst: (outcome: SessionRefreshOutcome) => void = () => {};
    const first = new Promise<SessionRefreshOutcome>((resolve) => {
      settleFirst = resolve;
    });
    const final = sendRefreshWithBackoff(
      o.transport,
      o.maxRateLimitRetries,
      settleFirst,
    )
      .then((outcome) => applyOutcome(outcome, startToken))
      .catch((error: unknown): SessionRefreshOutcome => {
        console.error("[@peppermint/api-client] refresh failed", error);
        return COOLING_DOWN;
      })
      .then((outcome) => {
        flight = null;
        settleFirst(outcome);
        return outcome;
      });
    return { final, first };
  };

  const refresh = ({ failFast = false }: RefreshOptions = {}) => {
    const token = readAccess();
    // No access token: signed out (deliberately, or by an earlier refusal). A late
    // 401 must not refresh — it would resurrect the session or redirect twice.
    if (!token) return Promise.resolve<SessionRefreshOutcome>(SIGNED_OUT);
    if (token === failedToken) {
      return Promise.resolve<SessionRefreshOutcome>(SIGNED_OUT);
    }
    if (token !== cooldownToken) cooldownUntil = 0; // a new login resets cooldown
    if (!flight && Date.now() < cooldownUntil) {
      return Promise.resolve<SessionRefreshOutcome>(COOLING_DOWN);
    }
    flight ??= startFlight(token);
    return failFast ? flight.first : flight.final;
  };

  function onTimer() {
    timer = null;
    const expectedExpiry = scheduledFor;
    scheduledFor = null;
    if (!readAccess()) return;
    const expiry = readExpiry();
    // Another tab refreshed while this timer waited — follow its new expiry.
    if (expiry !== null && expiry !== expectedExpiry) {
      sync();
      return;
    }
    // Another tab attempted within the floor — wait it out instead of piling on.
    if (Date.now() < proactiveFloor()) {
      startTimer(proactiveFloor(), expiry);
      return;
    }
    void refresh().then((outcome) => {
      if (outcome.kind === "unavailable" && readAccess()) {
        const retryAt = Math.max(
          Date.now() + UNAVAILABLE_RETRY_MS,
          cooldownUntil,
        );
        startTimer(retryAt, readExpiry());
      }
    });
  }

  const isAccessExpired = () => {
    if (!o.proactive || !readAccess()) return false;
    const expiry = readExpiry();
    const now = Date.now();
    return (
      expiry !== null &&
      now >= expiry &&
      now >= proactiveFloor() &&
      now >= cooldownUntil
    );
  };

  if (o.proactive && typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
      const { key } = event;
      if (
        key === null ||
        key === o.accessTokenKey ||
        key === o.accessExpiresAtKey
      ) {
        sync();
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") sync();
    });
    sync();
  }

  return { refresh, sync, isAccessExpired };
}
