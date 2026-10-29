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

export interface RefreshSession {
  /** Single-flight refresh: concurrent callers in this tab share one request. */
  refresh: () => Promise<RefreshOutcome>;
  /** (Re)schedule the proactive refresh from the stored expiry. Cheap; idempotent. */
  sync: () => void;
  /** The stored access token is past its stored expiry (and a refresh is allowed). */
  isAccessExpired: () => boolean;
}

/** Retry delay for a proactive refresh that came back `unavailable`. */
const UNAVAILABLE_RETRY_MS = 15_000;
/**
 * Floor between proactive refreshes in one tab. Guards against a refresh loop when
 * the client clock runs ahead of the server's (every fresh expiry would look past).
 */
const MIN_PROACTIVE_INTERVAL_MS = 30_000;
/** Spread so several tabs don't all fire at the same instant. */
const MAX_JITTER_MS = 5_000;
/** A timer this late (throttled background tab, sleep) is fired immediately. */
const OVERDUE_SLACK_MS = 1_000;
const MAX_TIMEOUT_MS = 2_147_483_647;

/**
 * Owns refresh state for one client instance: single-flight refresh, token
 * persistence, the auth-failure hand-off, and the proactive timer.
 *
 * Multi-tab: every tab reads the same localStorage expiry. Whichever tab fires first
 * writes the new token + expiry; the others see it via the `storage` event (and a
 * re-check when their own timer fires) and reschedule instead of refreshing. If two
 * tabs do refresh at once the server's reuse grace window answers both.
 */
export function createRefreshSession(o: RefreshSessionOptions): RefreshSession {
  let inflight: Promise<RefreshOutcome> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let scheduledFor: number | null = null;
  let timerDueAt = 0;
  let lastRefreshAt = 0;

  const hasAccess = () => Boolean(readStorage(o.accessTokenKey));

  const readExpiry = (): number | null => {
    const raw = readStorage(o.accessExpiresAtKey);
    const ms = raw ? Date.parse(raw) : NaN;
    return Number.isNaN(ms) ? null : ms;
  };

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
    if (expiry === null || !hasAccess()) {
      clearTimer();
      return;
    }
    const overdue = Date.now() > timerDueAt + OVERDUE_SLACK_MS;
    if (timer && scheduledFor === expiry && !overdue) return;
    const dueAt = Math.max(
      expiry - o.leadTimeMs - Math.random() * MAX_JITTER_MS,
      lastRefreshAt + MIN_PROACTIVE_INTERVAL_MS,
    );
    startTimer(dueAt, expiry);
  };

  const applyOutcome = (outcome: RefreshOutcome) => {
    if (outcome.kind === "ok") {
      lastRefreshAt = Date.now();
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
      sync();
    } else if (outcome.kind === "rejected") {
      clearTimer();
      o.onAuthFailure(outcome.info);
    }
  };

  const refresh = () => {
    inflight ??= sendRefreshWithBackoff(o.transport, o.maxRateLimitRetries)
      .then((outcome) => {
        applyOutcome(outcome);
        return outcome;
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  };

  function onTimer() {
    timer = null;
    const expectedExpiry = scheduledFor;
    scheduledFor = null;
    if (!hasAccess()) return;
    const expiry = readExpiry();
    // Another tab refreshed while this timer waited — follow its new expiry.
    if (expiry !== null && expiry !== expectedExpiry) {
      sync();
      return;
    }
    void refresh().then((outcome) => {
      if (outcome.kind === "unavailable" && hasAccess()) {
        startTimer(Date.now() + UNAVAILABLE_RETRY_MS, readExpiry());
      }
    });
  }

  const isAccessExpired = () => {
    if (!o.proactive || !hasAccess()) return false;
    const expiry = readExpiry();
    const now = Date.now();
    return (
      expiry !== null &&
      now >= expiry &&
      now - lastRefreshAt >= MIN_PROACTIVE_INTERVAL_MS
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
