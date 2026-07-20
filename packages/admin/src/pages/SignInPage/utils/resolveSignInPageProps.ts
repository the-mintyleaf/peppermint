import type {
  ResolvedSignInPageProps,
  SignInPageProps,
} from "../SignInPage.types";

/**
 * Applies every presentational default once, at the page level, so all layout
 * variants receive an identical fully-populated shape. Defaulting inside a
 * layout instead would let each variant disagree about the fallback copy — and
 * would leave a new variant reading `heading[0]` off `undefined`.
 */
export function resolveSignInPageProps(
  props: SignInPageProps,
): ResolvedSignInPageProps {
  return {
    ...props,
    heading: props.heading ?? ["Sign into", "to your portal."],
    subheading:
      props.subheading ?? "Enter your credentials to access your account.",
    brand: props.brand ?? ["Portal", "by Peppermint"],
    panelTagline: props.panelTagline ?? "Work done right.",
    panelHeading:
      props.panelHeading ??
      "Sketched from the ground up to make the work work.",
    disableSignUp: props.disableSignUp ?? false,
    disableForgotPassword: props.disableForgotPassword ?? false,
    hasGoogleLogin: props.hasGoogleLogin ?? false,
    hasAppleLogin: props.hasAppleLogin ?? false,
    hasDiscordLogin: props.hasDiscordLogin ?? false,
    hasMagicLinkLogin: props.hasMagicLinkLogin ?? false,
  };
}
