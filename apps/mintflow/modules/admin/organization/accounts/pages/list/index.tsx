"use client";

import { DataTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { fetchAccounts } from "../../accounts.api";
import { ACCOUNTS_COLUMNS } from "./list.columns";
import { ACCOUNTS_QUERY_KEY, ACCOUNTS_BASE_PATH } from "../../accounts.config";
import type { Account } from "../../accounts.types";

const TABS: DataTableShellTab[] = [
  { label: "All Accounts" },
  { label: "Active", filter: { status: "active" } },
  { label: "Inactive", filter: { status: "inactive" } },
];

export function AccountsList() {
  return (
    <Paper p={0} withBorder radius="md" h="calc(100vh - 16px)">
      <DataTableShell<Account>
        queryKey={ACCOUNTS_QUERY_KEY}
        queryGetFn={(params) => fetchAccounts(params)}
        dataKey="data"
        paginationKey="meta"
        enableServerQuery
        columns={ACCOUNTS_COLUMNS}
        moduleInfo={{
          name: "Account",
          label: "Accounts",
          description: "Manage user accounts and their role assignments",
        }}
        basePath={ACCOUNTS_BASE_PATH}
        tabs={TABS}
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
      />
    </Paper>
  );
}
