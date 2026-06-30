"use client";

import { PasswordChangePage } from "@peppermint/admin";

export function ModulePasswordChange() {
  return (
    <PasswordChangePage
      changePasswordApi="/api/auth/password/change"
      successRedirectUrl="/admin"
    />
  );
}
