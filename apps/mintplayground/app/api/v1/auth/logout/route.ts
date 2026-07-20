import { delay, ok } from "@/lib/mock/respond";

/**
 * `POST /api/v1/auth/logout/` — always succeeds. The tokens live in
 * `localStorage` and the client clears them in `onSettled` regardless of the
 * outcome, so there is nothing to revoke server-side.
 */
export async function POST() {
  await delay(150);
  return ok({ detail: "Signed out." });
}
