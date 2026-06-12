"use client";

import { DataTableShell } from "@zetsel/admin";
import { Paper } from "@zetsel/ui";
import type { DataTableShellTab } from "@zetsel/admin";
import { ListIcon }        from "@phosphor-icons/react/dist/csr/List";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { WarningIcon }     from "@phosphor-icons/react/dist/csr/Warning";
import { ArrowUUpLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowUUpLeft";
import { fetchLoans } from "../../module.api";
import { LOAN_COLUMNS } from "./list.columns";
import type { Loan } from "../../module.api";

const STATUS_TABS: DataTableShellTab[] = [
  { label: "All Loans", icon: ListIcon },
  { label: "Active",    icon: CheckCircleIcon,  filter: { status: "active" } },
  { label: "Overdue",   icon: WarningIcon,      filter: { status: "overdue" } },
  { label: "Returned",  icon: ArrowUUpLeftIcon, filter: { status: "returned" } },
];

export function LoansList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <DataTableShell<Loan>
        queryKey="loans.list"
        queryGetFn={(params) => fetchLoans(params)}
        dataKey="data"
        paginationKey="meta"
        enableServerQuery
        columns={LOAN_COLUMNS}
        moduleInfo={{
          name: "Loan",
          label: "Loans",
          description: "Track book loans across all members",
        }}
        basePath="/admin/loans"
        tabs={STATUS_TABS}
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
      />
    </Paper>
  );
}
