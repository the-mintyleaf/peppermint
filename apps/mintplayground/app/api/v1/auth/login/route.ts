import { delay, fail, ok, readJson } from "@/lib/mock/respond";
import {
  createChallenge,
  touchLastLogin,
  verifyCredentials,
} from "@/lib/mock/store";
import { issueTokens } from "@/lib/mock/tokens";

interface LoginBody {
  identifier?: string;
  username?: string;
  email?: string;
  password?: string;
}

/**
 * `POST /api/v1/auth/login/` — mock sign-in.
 *
 * An MFA account gets a challenge instead of tokens; everyone else gets a
 * session. A forced-change account gets a real session too, and is stopped at
 * the app shell by the `password_change_required` flag on its `/me` profile —
 * that keeps the change form authenticated, so it can use the same
 * `old_password` endpoint as a voluntary change.
 */
export async function POST(request: Request) {
  await delay();

  const body = await readJson<LoginBody>(request);
  const identifier = body?.identifier ?? body?.username ?? body?.email ?? "";
  const password = body?.password ?? "";

  if (!identifier || !password) {
    return fail(
      400,
      "VALIDATION_ERROR",
      "Enter both your username and password.",
    );
  }

  const account = verifyCredentials(identifier, password);
  if (!account) {
    return fail(
      401,
      "AUTH_INVALID_CREDENTIALS",
      "Invalid username or password.",
    );
  }

  const username = account.profile.username;

  if (account.requiresMfa) {
    return ok({ mfa_required: true, challenge_id: createChallenge(username) });
  }

  touchLastLogin(username);
  return ok(issueTokens(username));
}
