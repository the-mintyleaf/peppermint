"use client";

import { SignInPage } from "@peppermint/admin";

export function ModuleSignIn() {
  return (
    <SignInPage
      heading={["Sign into", "mintflow."]}
      subheading="Don't have an account? Ask your administrator to invite you."
      brand={["mintyflow", "by mintyleaf.co"]}
      panelTagline="Work done right."
      panelHeading="Sketched from the ground up to make the work work."
      loginApi="/api/auth/login"
      skipEmailValidation
      successRedirectUrl="/admin"
      disableForgotPassword={true}
      disableSignUp
    />
  );
}
