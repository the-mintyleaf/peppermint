"use client";

import { useEffect } from "react";
import { SignInPage } from "@peppermint/admin";
import { notifications } from "@peppermint/ui";
import { ERROR_MESSAGES } from "@/lib/authErrorMessages";
import { MOCK_CREDENTIAL_HINTS, MOCK_PASSWORD } from "@/lib/mock/accounts";

/**
 * The demo accounts, spelled out on the page. There is no registration and no
 * real backend, so hiding the credentials would only make the playground
 * unusable.
 */
const CREDENTIAL_LINE = MOCK_CREDENTIAL_HINTS.map(
  ({ username, note }) => `${username} — ${note}`,
).join(" · ");

export function ModuleSignIn() {
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      window.location.href = "/home";
    }
  }, []);

  return (
    <SignInPage
      variant="modernlines"
      heading={["Sign into", "the mintplayground."]}
      subheading={`Any of: ${CREDENTIAL_LINE}. Password for all: ${MOCK_PASSWORD}`}
      brand={["mintplayground", "by mintyleaf.co"]}
      panelTagline="A frontend and UI/UX sandbox — no backend, all mock data."
      panelHeading="Somewhere to try things out before they reach a real app."
      loginApi="/api/v1/auth/login/"
      mfaVerifyApi="/api/v1/auth/mfa/totp/verify/"
      identifierField="identifier"
      successRedirectUrl="/home"
      disableForgotPassword
      disableSignUp
      errorMessageMap={ERROR_MESSAGES}
      onMfaSetupRecommended={() =>
        notifications.show({
          color: "blue",
          title: "Consider enabling MFA",
          message:
            "You can set up multi-factor authentication under Account & Security.",
        })
      }
    />
  );
}
