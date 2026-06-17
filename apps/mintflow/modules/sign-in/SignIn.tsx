"use client";

import { SignInPage } from "@peppermint/admin";

export function ModuleSignIn() {
  return (
    <SignInPage
      heading={["Welcome Back!", "to Mintflow."]}
      subheading="Sign in to get started."
      loginApi="/api/auth/login"
      successRedirectUrl="/admin"
      disableForgotPassword={false}
      disableSignUp
      hasGoogleLogin
      hasAppleLogin
    />
  );
}
