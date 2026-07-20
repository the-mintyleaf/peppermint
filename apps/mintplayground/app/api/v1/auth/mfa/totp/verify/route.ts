import { MOCK_MFA_CODE } from "@/lib/mock/accounts";
import { delay, fail, ok, readJson } from "@/lib/mock/respond";
import {
  consumeChallenge,
  peekChallenge,
  touchLastLogin,
} from "@/lib/mock/store";
import { issueTokens } from "@/lib/mock/tokens";

interface VerifyBody {
  challenge_id?: string;
  code?: string;
}

/**
 * `POST /api/v1/auth/mfa/totp/verify/` — mock TOTP verification.
 *
 * A wrong code leaves the challenge open so the user can retry on the same id;
 * only an accepted code spends it.
 */
export async function POST(request: Request) {
  await delay();

  const body = await readJson<VerifyBody>(request);
  const challengeId = body?.challenge_id ?? "";
  const code = (body?.code ?? "").trim();

  const username = challengeId ? peekChallenge(challengeId) : null;

  if (username === null || username === "expired") {
    return fail(
      401,
      "AUTH_MFA_CHALLENGE_EXPIRED",
      "Your verification session expired. Restart sign-in to get a new code.",
    );
  }

  if (code !== MOCK_MFA_CODE) {
    return fail(
      401,
      "AUTH_MFA_INVALID_CODE",
      "That code isn't valid. Please try again.",
    );
  }

  consumeChallenge(challengeId);
  touchLastLogin(username);
  return ok(issueTokens(username));
}
