import { delay, fail, ok } from "@/lib/mock/respond";
import { getProfile } from "@/lib/mock/store";
import { readBearer } from "@/lib/mock/tokens";

/**
 * `GET /api/v1/auth/me/` — the signed-in profile. A 401 here is what drives the
 * api-client's single-flight refresh, so an expired access token exercises that
 * path for real.
 */
export async function GET(request: Request) {
  await delay(160);

  const username = readBearer(request);
  const profile = username ? getProfile(username) : null;

  if (!profile) {
    return fail(
      401,
      "AUTH_TOKEN_INVALID",
      "Your session has expired. Please sign in again.",
    );
  }

  return ok(profile);
}
