"use client";

import { useParams } from "next/navigation";
import { Paper } from "@peppermint/ui";
import { LoanView } from "./LoanView";

export function LoansView() {
  const { id } = useParams<{ id: string }>();
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <LoanView loanId={id} />
    </Paper>
  );
}
