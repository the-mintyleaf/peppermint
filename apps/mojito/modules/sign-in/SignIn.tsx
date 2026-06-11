"use client";

import { SignInPage } from "@zetsel/admin";

export function ModuleSignIn() {
  return (
    <SignInPage
      heading={["Welcome Back!", "to Mojito by MintyLeaf."]}
      subheading="Sign in to get started."
      loginApi="/api/auth/login/"
      successRedirectUrl="/admin"
      disableForgotPassword={false}
      disableSignUp
      hasGoogleLogin
      hasAppleLogin
    />
  );
}
