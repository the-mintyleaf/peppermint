import api from "@/lib/api";

export interface ChangeOwnPasswordValues {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface FirstLoginChangeValues {
  challenge_token: string;
  new_password: string;
  new_password_confirm: string;
}

/**
 * `POST /api/v1/auth/password/change/` (bearer). Revokes ALL sessions (including the
 * current one) and clears the refresh cookie — the caller must re-authenticate.
 */
export async function changeOwnPassword(
  values: ChangeOwnPasswordValues,
): Promise<void> {
  await api.post("/api/v1/auth/password/change/", values);
}

/**
 * `POST /api/v1/auth/password/first-login-change/` (public; uses the login challenge).
 * On success the account then signs in normally with the new password.
 */
export async function firstLoginChangePassword(
  values: FirstLoginChangeValues,
): Promise<void> {
  await api.post("/api/v1/auth/password/first-login-change/", values);
}
