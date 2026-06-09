"use client";

import { SignInPage } from "@zetsel/admin";

export default function Home() {
  return (
    <SignInPage
      heading={["Welcome Back!", "to Mojito"]}
      subheading="Sign in to get started."
      loginApi="/api/auth/login/"
      successRedirectUrl="/admin"
      disableForgotPassword={false}
      disableSignUp={true}
    />
  );
}
