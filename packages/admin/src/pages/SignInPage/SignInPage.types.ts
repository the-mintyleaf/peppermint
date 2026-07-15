export type SignInIdentifierField = "email" | "username" | "identifier";

/** Unwrapped login/MFA response payload the page reads tokens and flags from. */
export interface SignInResultData {
  access?: string;
  accessToken?: string;
  /** Grandway-style access token field (`{ access_token, access_expires_at }`). */
  access_token?: string;
  access_expires_at?: string;
  refresh?: string;
  refreshToken?: string;
  mfa_required?: boolean;
  challenge_id?: string;
  mfa_setup_recommended?: boolean;
  /**
   * First-login challenge fields: some backends respond to a login attempt on a
   * forced-password-change account with a challenge (and no session) instead of tokens.
   */
  password_change_required?: boolean;
  next_action?: string;
  challenge_token?: string;
  challenge_expires_at?: string;
  error?: { code?: string; message?: string };
  message?: string;
  [key: string]: unknown;
}

export interface SignInPageProps {
  heading?: [string, string];
  subheading?: string;
  brand?: [string, string];
  panelTagline?: string;
  panelHeading?: string;
  icon?: React.ReactNode;
  loginApi: string;
  /** Which key the entered credential is sent under, e.g. `{ identifier, password }`. Defaults from `skipEmailValidation`. */
  identifierField?: SignInIdentifierField;
  skipEmailValidation?: boolean;
  successRedirectUrl: string;
  forgotRedirectUrl?: string;
  onSuccess?: (data: SignInResultData) => void;
  onError?: (error: unknown) => void;
  onForgotPassword?: () => void;
  hasGoogleLogin?: boolean;
  hasAppleLogin?: boolean;
  hasDiscordLogin?: boolean;
  hasMagicLinkLogin?: boolean;
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  onDiscordLogin?: () => void;
  onMagicLinkLogin?: (email: string) => Promise<void>;
  disableSignUp?: boolean;
  disableForgotPassword?: boolean;
  /**
   * Endpoint for MFA challenge verification (`{ challenge_id, code }`). When set, a login
   * response shaped like `{ mfa_required: true, challenge_id }` switches the page to an
   * inline MFA code screen instead of treating it as a success or an error. When unset,
   * MFA-shaped responses are treated as a misconfiguration error.
   */
  mfaVerifyApi?: string;
  /** Called when the login response sets `mfa_setup_recommended: true` on a non-MFA success. */
  onMfaSetupRecommended?: () => void;
  /**
   * Called when the login response is a first-login challenge
   * (`password_change_required: true` or `next_action: "first_login_password_change"`)
   * that carries no session. The page stops (no token error, no redirect) and hands the
   * full response to this callback — typically to stash the `challenge_token` and route
   * to a forced-password-change page. When unset, such a response falls through to the
   * standard "no access token" handling.
   */
  onPasswordChangeRequired?: (data: SignInResultData) => void;
  /**
   * Send credentials (cookies) with the login / MFA fetch so a cookie-based backend can
   * set its session cookies (e.g. an HttpOnly refresh cookie + CSRF cookie). Defaults to
   * `false` — leave it off for token-in-body backends whose login endpoint may respond
   * with a wildcard CORS origin (which the browser rejects under credentialed requests).
   */
  withCredentials?: boolean;
  /** Optional error-code -> message overrides. Falls back to the backend's own `error.message`/`message`. */
  errorMessageMap?: Record<string, string>;
}
