"use client";

import { Paper } from "@peppermint/ui";
import { LoanForm } from "../../form";

export function LoansNew() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <LoanForm onBack={() => history.back()} />
    </Paper>
  );
}
