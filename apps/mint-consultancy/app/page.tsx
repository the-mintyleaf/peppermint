"use client";

import { SignInPage } from "@zetsel/admin";

export default function Home() {
  return (
    <SignInPage
      heading={["Welcome Back!", "to Mint Consultancy"]}
      subheading="Manage your students and documents with ease."
      loginApi="/api/auth/login/"
      successRedirectUrl="/admin/students"
      disableForgotPassword={false}
      disableSignUp={true}
    />
  );
}
