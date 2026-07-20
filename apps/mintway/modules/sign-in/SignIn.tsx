"use client";

import { useEffect } from "react";
import { SignInPage } from "@peppermint/admin";
import { ERROR_MESSAGES } from "@/lib/authErrorMessages";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Where the sign-in page stashes the first-login challenge token for /password-change. */
export const FIRST_LOGIN_CHALLENGE_KEY = "mw_first_login_challenge";

export function ModuleSignIn() {
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      window.location.href = "/admin";
    }
  }, []);

  return (
    <SignInPage
      heading={["Sign into", "mintway."]}
      subheading="Don't have an account? Ask your administrator to create one."
      brand={["mintway", "by mintyleaf.co"]}
      panelTagline="Work done right."
      panelHeading="Sketched from the ground up to make the work work."
      panelBackgroundImage="https://images.pexels.com/photos/30788621/pexels-photo-30788621.jpeg"
      loginApi={`${API_URL}/api/v1/auth/login/`}
      identifierField="username"
      successRedirectUrl="/admin"
      withCredentials
      disableForgotPassword
      disableSignUp
      errorMessageMap={ERROR_MESSAGES}
      onPasswordChangeRequired={(data) => {
        // First-login account: stash the challenge and hand off to the forced
        // password-change page (no session was created).
        if (typeof data.challenge_token === "string") {
          sessionStorage.setItem(
            FIRST_LOGIN_CHALLENGE_KEY,
            data.challenge_token,
          );
        }
        window.location.href = "/password-change";
      }}
    />
  );
}
