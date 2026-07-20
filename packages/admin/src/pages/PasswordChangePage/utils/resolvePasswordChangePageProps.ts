import type {
  PasswordChangePageProps,
  PasswordChangePhase,
  ResolvedPasswordChangePageProps,
} from "../PasswordChangePage.types";

/** Backend-side floor this page assumes when the host app names no other. */
export const DEFAULT_MIN_PASSWORD_LENGTH = 12;

/**
 * Applies every presentational default once, at the page level, so all layout
 * variants receive an identical fully-populated shape. Defaulting inside a
 * layout instead would let each variant disagree about the fallback copy — and
 * would leave a new variant reading `heading[0]` off `undefined`.
 */
export function resolvePasswordChangePageProps(
  props: PasswordChangePageProps,
): ResolvedPasswordChangePageProps {
  return {
    ...props,
    heading: props.heading ?? ["Change your", "password."],
    subheading:
      props.subheading ??
      "Enter your current password, then choose a new one you haven't used before.",
    brand: props.brand ?? ["Portal", "by Peppermint"],
    panelTagline: props.panelTagline ?? "Account security.",
    panelHeading:
      props.panelHeading ?? "A new password is all that stands in the way.",
    minPasswordLength: props.minPasswordLength ?? DEFAULT_MIN_PASSWORD_LENGTH,
  };
}

/**
 * The page heading for the current phase. Once the change has landed, the
 * consumer's "Change your password." would be instructing the user to do the
 * thing they just did — so the one page-level anchor reports the outcome
 * instead, and the body no longer needs a heading of its own.
 */
export function headingForPhase(
  heading: [string, string],
  phase: PasswordChangePhase,
): [string, string] {
  return phase === "form" ? heading : ["Password", "updated."];
}
