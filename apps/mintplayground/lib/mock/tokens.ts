/**
 * Opaque-ish tokens for the mock auth API: base64url JSON carrying the subject,
 * the kind, and an expiry. This is deliberately NOT a JWT and carries no
 * signature — nothing here is a security boundary. The playground has no
 * backend, and the client already treats the token as opaque (identity comes
 * from `/api/v1/auth/me/`, never from decoding the token).
 */

export type MockTokenKind = "access" | "refresh";

interface MockTokenPayload {
  sub: string;
  kind: MockTokenKind;
  /** Epoch milliseconds. */
  exp: number;
}

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 12 * 60 * 60 * 1000;

function encode(payload: MockTokenPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decode(token: string): MockTokenPayload | null {
  try {
    const raw = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8"),
    ) as unknown;
    if (
      !raw ||
      typeof raw !== "object" ||
      typeof (raw as MockTokenPayload).sub !== "string" ||
      typeof (raw as MockTokenPayload).exp !== "number"
    ) {
      return null;
    }
    return raw as MockTokenPayload;
  } catch {
    return null;
  }
}

export function issueTokens(username: string): {
  access: string;
  refresh: string;
  access_expires_at: string;
} {
  const now = Date.now();
  return {
    access: encode({ sub: username, kind: "access", exp: now + ACCESS_TTL_MS }),
    refresh: encode({
      sub: username,
      kind: "refresh",
      exp: now + REFRESH_TTL_MS,
    }),
    access_expires_at: new Date(now + ACCESS_TTL_MS).toISOString(),
  };
}

/** Returns the subject of a live token of the expected kind, else `null`. */
export function readToken(
  token: string | null | undefined,
  kind: MockTokenKind,
): string | null {
  if (!token) return null;
  const payload = decode(token);
  if (!payload || payload.kind !== kind || payload.exp < Date.now()) {
    return null;
  }
  return payload.sub;
}

/** Pull the bearer subject out of a request's `Authorization` header. */
export function readBearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return readToken(header.slice(7).trim(), "access");
}
