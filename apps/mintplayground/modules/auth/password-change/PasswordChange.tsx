"use client";

import { PasswordChangePage } from "@peppermint/admin";
import { ERROR_MESSAGES } from "@/lib/authErrorMessages";

export function ModulePasswordChange() {
  return (
    <PasswordChangePage
      variant="modernlines"
      heading={["Change your", "password."]}
      subheading="Enter your current password, then choose a new one you haven't used before."
      brand={["mintplayground", "by mintyleaf.co"]}
      panelTagline="Account security."
      panelHeading="A new password is all that stands between you and the sandbox."
      changePasswordApi="/api/v1/auth/change-password/"
      successRedirectUrl="/home"
      errorMessageMap={ERROR_MESSAGES}
    />
  );
}
