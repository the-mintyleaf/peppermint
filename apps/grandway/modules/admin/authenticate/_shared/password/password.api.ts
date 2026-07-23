import api from "@/lib/api";

export interface ChangeOwnPasswordValues {
  current_password: string;
  new_password: string;
}

/**
 * `POST /api/v1/auth/password/change/` (bearer) — API §7. Also used for the forced
 * first-login change (the user already holds an access token from `login`, even while
 * `must_change_password` is true). Revokes ALL sessions on success, including the
 * current one — the caller must re-authenticate.
 */
export async function changeOwnPassword(
  values: ChangeOwnPasswordValues,
): Promise<void> {
  await api.post("/api/v1/auth/password/change/", values);
}
