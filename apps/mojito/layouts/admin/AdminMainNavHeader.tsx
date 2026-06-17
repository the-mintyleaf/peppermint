"use client";

import { MainNavIconButton } from "@peppermint/admin";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";

export function AdminMainNavHeader() {
  return (
    <MainNavIconButton
      icon={SparkleIcon}
      label="Brand"
      href="/admin"
      iconWeight="fill"
      iconColor="var(--mantine-color-brand-5)"
    />
  );
}
