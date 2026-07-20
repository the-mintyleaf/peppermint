import type { CurrentUser } from "@/modules/auth/_shared/auth.types";

/**
 * A playground account. `password` and the MFA flag live alongside the profile
 * because there is no backend to hold them — the route handlers under
 * `app/api/v1/auth/` are the whole "server".
 */
export interface MockAccount {
  password: string;
  /** Sign-in returns an MFA challenge instead of tokens for this account. */
  requiresMfa?: boolean;
  profile: CurrentUser;
}

/** The one TOTP code every MFA-enabled playground account accepts. */
export const MOCK_MFA_CODE = "123456";

/** Every playground account shares this password — it is printed on the page. */
export const MOCK_PASSWORD = "playground";

const BASE_PROFILE = {
  email: null,
  actor_type: "human",
  account_status: "active",
  is_login_enabled: true,
  is_active: true,
  last_login: "2026-07-19T09:12:00Z",
  created_at: "2026-01-04T10:00:00Z",
  updated_at: "2026-07-19T09:12:00Z",
} satisfies Partial<CurrentUser>;

/**
 * The four accounts, each one wired to exercise a different branch of the auth
 * UI: the happy path, the role-filtered nav, the forced password change, and
 * the MFA challenge screen.
 */
export const MOCK_ACCOUNTS: Record<string, MockAccount> = {
  minister: {
    password: MOCK_PASSWORD,
    profile: {
      ...BASE_PROFILE,
      id: "usr_minister",
      username: "minister",
      email: "minister@mintplayground.test",
      display_name: "Aarati Shrestha",
      is_staff: true,
      is_superuser: true,
    },
  },

  officer: {
    password: MOCK_PASSWORD,
    profile: {
      ...BASE_PROFILE,
      id: "usr_officer",
      username: "officer",
      email: "officer@mintplayground.test",
      display_name: "Bikash Rai",
      is_staff: false,
      is_superuser: false,
    },
  },

  newjoiner: {
    password: MOCK_PASSWORD,
    profile: {
      ...BASE_PROFILE,
      id: "usr_newjoiner",
      username: "newjoiner",
      display_name: "Deepa Karki",
      is_staff: false,
      is_superuser: false,
      password_change_required: true,
      last_login: null,
    },
  },

  secure: {
    password: MOCK_PASSWORD,
    requiresMfa: true,
    profile: {
      ...BASE_PROFILE,
      id: "usr_secure",
      username: "secure",
      email: "secure@mintplayground.test",
      display_name: "Nabin Gurung",
      is_staff: true,
      is_superuser: false,
    },
  },
};

/** The demo credentials rendered on the sign-in screen. */
export const MOCK_CREDENTIAL_HINTS = [
  { username: "minister", note: "full access" },
  { username: "officer", note: "limited nav" },
  { username: "newjoiner", note: "forced password change" },
  { username: "secure", note: `MFA — code ${MOCK_MFA_CODE}` },
];
