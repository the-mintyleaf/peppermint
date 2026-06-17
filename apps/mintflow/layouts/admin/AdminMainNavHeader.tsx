"use client";

import { MainNavIconButton } from "@peppermint/admin";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";

export function AdminMainNavHeader() {
  return (
    <MainNavIconButton
      icon={KanbanIcon}
      label="Mintflow"
      href="/admin"
      iconWeight="fill"
      iconColor="var(--mantine-color-brand-5)"
    />
  );
}
