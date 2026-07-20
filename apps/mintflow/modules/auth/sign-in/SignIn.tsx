"use client";

import { useEffect } from "react";
import { SignInPage } from "@peppermint/admin";
import { notifications } from "@peppermint/ui";
import { ERROR_MESSAGES } from "@/lib/authErrorMessages";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function ModuleSignIn() {
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <SignInPage
      variant="modernlines"
      heading={["Sign into", "mintflow."]}
      subheading="Don't have an account? Ask your administrator to invite you."
      brand={["mintflow", "by mintyleaf.co"]}
      panelTagline="Work done right."
      panelHeading="Sketched from the ground up to make the work work."
      loginApi={`${API_URL}/api/v1/auth/login/`}
      mfaVerifyApi={`${API_URL}/api/v1/auth/mfa/totp/verify/`}
      identifierField="identifier"
      successRedirectUrl="/dashboard"
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
