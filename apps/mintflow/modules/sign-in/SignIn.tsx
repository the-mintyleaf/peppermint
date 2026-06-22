"use client";

import { SignInPage } from "@peppermint/admin";

export function ModuleSignIn() {
  return (
    <SignInPage
      heading={["Sign into", "mintflow."]}
      subheading="Don't have an account? Ask your administrator to invite you."
      loginApi="/api/auth/login"
      successRedirectUrl="/admin"
      disableForgotPassword={false}
      disableSignUp
      hasGoogleLogin
      hasAppleLogin
    />
  );
}
