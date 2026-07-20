import { delay, fail, ok, readJson } from "@/lib/mock/respond";
import { getProfile } from "@/lib/mock/store";
import { issueTokens, readToken } from "@/lib/mock/tokens";

interface RefreshBody {
  refresh?: string;
}

/**
 * `POST /api/v1/auth/refresh/` — body-mode refresh, matching the api-client's
 * default (`{ refresh }` in, new `access`/`refresh` out).
 */
export async function POST(request: Request) {
  await delay(200);

  const body = await readJson<RefreshBody>(request);
  const username = readToken(body?.refresh, "refresh");

  if (!username || !getProfile(username)) {
    return fail(
      401,
      "AUTH_REFRESH_REQUIRED",
      "Your session has expired. Please sign in again.",
    );
  }

  return ok(issueTokens(username));
}
