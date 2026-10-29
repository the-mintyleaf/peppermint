import type { LoginTokens } from "@/modules/admin/authenticate/_shared/authenticate.types";

export interface SignInFormValues extends Record<string, unknown> {
  username: string;
  password: string;
  otp_code: string;
}

/**
 * `login`'s Session tokens + `access_expires_at` (ISO 8601 UTC, contract v1.4.0 —
 * `authenticate/INTEGRATION.md` §4). Optional so an older backend still types.
 */
export type SignInLoginResult = LoginTokens & { access_expires_at?: string };
