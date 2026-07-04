export type SignInIdentifierField = "email" | "username" | "identifier";

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
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
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
  /** Optional endpoint to fetch the current user after a successful login/verify, stored as `user_data`. */
  meApi?: string;
  /** Called when the login response sets `mfa_setup_recommended: true` on a non-MFA success. */
  onMfaSetupRecommended?: () => void;
  /** Optional error-code -> message overrides. Falls back to the backend's own `error.message`/`message`. */
  errorMessageMap?: Record<string, string>;
}
