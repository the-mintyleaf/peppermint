"use client";

import { MainNavIconButton } from "@zetsel/admin";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";

export function AdminMainNavHeader() {
  return (
    <MainNavIconButton
      icon={SparkleIcon}
      label="Brand"
      href="/admin"
    />
  );
}
