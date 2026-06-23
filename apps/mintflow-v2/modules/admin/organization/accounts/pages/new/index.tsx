"use client";

import { Paper } from "@peppermint/ui";
import { AccountForm } from "../../form";

export function AccountsNew() {
  return (
    <Paper p={0} withBorder radius="md" h="calc(100vh - 16px)">
      <AccountForm onBack={() => history.back()} />
    </Paper>
  );
}
