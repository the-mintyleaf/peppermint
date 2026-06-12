"use client";

import { MainNavIconButton } from "@zetsel/admin";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";

export function AdminMainNavHeader() {
  return (
    <MainNavIconButton
      icon={GraduationCapIcon}
      label="Consultancy"
      href="/admin"
    />
  );
}
