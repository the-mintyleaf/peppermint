import { NextResponse } from "next/server";

/**
 * Response helpers that mirror the real Peppermint envelope
 * (`{ success, data }` / `{ error: { code, message } }`) so the carried-over
 * client code — the api-client's unwrap, `getApiError`, `SignInPage`'s error
 * resolver — runs its real paths against the mock.
 */

/** Artificial latency so loading states are actually visible in the UI. */
export function delay(ms = 320): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ok<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data });
}

export function fail(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** `400` for a malformed or unparseable JSON body. */
export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
