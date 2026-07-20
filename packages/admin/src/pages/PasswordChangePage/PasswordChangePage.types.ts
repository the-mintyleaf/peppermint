import type { UseFormReturnType } from "@peppermint/ui";

/**
 * Which page chrome the password-change screen renders in. `"default"` is the
 * brand-gradient panel + centred form card; `"modernlines"` is the bordered,
 * technical treatment built from 1px rules. Mirrors `SignInVariant` so an app
 * can dress both auth screens the same way.
 */
export type PasswordChangeVariant = "default" | "modernlines";

/** The phase of the change-password flow the page is currently in. */
export type PasswordChangePhase = "form" | "success" | "redirecting";

export interface PasswordChangeFormValues {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordChangePageProps {
  /** Page chrome to render. Defaults to `"default"`. */
  variant?: PasswordChangeVariant;
  heading?: [string, string];
  subheading?: string;
  brand?: [string, string];
  panelTagline?: string;
  panelHeading?: string;
  /**
   * Optional background image URL for the brand panel. When set, it replaces the
   * default gradient and is always dimmed to half brightness via a black overlay
   * so the panel text stays legible.
   */
  panelBackgroundImage?: string;
  /** Endpoint receiving `{ old_password, new_password }`. */
  changePasswordApi: string;
  /**
   * Minimum length enforced on submit. Must match the backend's own rule —
   * lowering it here does not lower it server-side, it only moves the rejection
   * from the field to a failed request. Defaults to 12.
   */
  minPasswordLength?: number;
  /** Where to send the user after a successful change. Omit to stay on the success state. */
  successRedirectUrl?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  /**
   * Send credentials (cookies) with the request so a cookie-based backend can read
   * its session. Defaults to `false` — token-in-body backends authenticate from the
   * stored access token, which the page attaches as a bearer header.
   */
  withCredentials?: boolean;
  /** Optional error-code -> message overrides. Falls back to the backend's own `error.message`/`message`. */
  errorMessageMap?: Record<string, string>;
}

/**
 * Everything the change-password flow owns that is independent of how the page
 * looks: the form instance, phase, mutation state and the submit handler.
 * Produced by `usePasswordChangeController` and consumed by every layout
 * variant unchanged.
 */
export interface PasswordChangeController {
  /**
   * The single form instance. It lives in the controller rather than inside the
   * form component so the strength meter and the submit button read the same
   * state without either layout having to own it.
   */
  form: UseFormReturnType<PasswordChangeFormValues>;
  phase: PasswordChangePhase;
  /** Resolved user-facing error for the current attempt, or `null`. */
  errorMessage: string | null;
  isLoading: boolean;
  /** The resolved length rule, so the form and the meter can never disagree on it. */
  minPasswordLength: number;
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * Page props with every presentational default already applied. Resolving these
 * once in `PasswordChangePage` — rather than per layout — is what lets a variant
 * read `page.heading[0]` without a guard, and stops two variants from drifting
 * apart on what "no heading supplied" means.
 */
export type ResolvedPasswordChangePageProps = PasswordChangePageProps &
  Required<
    Pick<
      PasswordChangePageProps,
      | "heading"
      | "subheading"
      | "brand"
      | "panelTagline"
      | "panelHeading"
      | "minPasswordLength"
    >
  >;

/**
 * The contract every layout variant implements: the flow state plus the
 * resolved presentational props. Keeping both layouts on one interface is what
 * makes them swappable by the `variant` dispatch.
 */
export interface PasswordChangeLayoutProps {
  controller: PasswordChangeController;
  page: ResolvedPasswordChangePageProps;
}
