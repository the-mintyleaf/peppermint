import { delay, fail, ok, readJson } from "@/lib/mock/respond";
import { getAccount, setPassword } from "@/lib/mock/store";
import { readBearer } from "@/lib/mock/tokens";

interface ChangePasswordBody {
  old_password?: string;
  new_password?: string;
}

/** Mirrors the client-side rule in `ChangePasswordForm.utils`. */
const MIN_LENGTH = 12;

/**
 * `POST /api/v1/auth/change-password/` — own-password change.
 *
 * Returns the two field-level error codes the form maps onto specific inputs
 * (`AUTH_PASSWORD_INVALID` → current password, `AUTH_PASSWORD_REUSE_BLOCKED` →
 * new password) so both branches are reachable in the playground.
 */
export async function POST(request: Request) {
  await delay();

  const username = readBearer(request);
  const account = username ? getAccount(username) : undefined;

  if (!account) {
    return fail(401, "AUTHENTICATION_REQUIRED", "Please sign in to continue.");
  }

  const body = await readJson<ChangePasswordBody>(request);
  const oldPassword = body?.old_password ?? "";
  const newPassword = body?.new_password ?? "";

  if (account.password !== oldPassword) {
    return fail(
      400,
      "AUTH_PASSWORD_INVALID",
      "The current password you entered is incorrect.",
    );
  }

  if (newPassword.length < MIN_LENGTH) {
    return fail(
      400,
      "VALIDATION_ERROR",
      `Your new password must be at least ${MIN_LENGTH} characters.`,
    );
  }

  if (newPassword === oldPassword) {
    return fail(
      400,
      "AUTH_PASSWORD_REUSE_BLOCKED",
      "That password has been used recently. Choose a different password.",
    );
  }

  setPassword(account.profile.username, newPassword);
  return ok({ detail: "Password updated." });
}
