"use client";

import { useCallback, useState } from "react";
import { DataTableShell } from "@peppermint/admin";
import type { DataTableShellModuleAccessChange } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { fetchAccounts } from "../../accounts.api";
import { ACCOUNTS_COLUMNS } from "./list.columns";
import { ACCOUNTS_QUERY_KEY, ACCOUNTS_BASE_PATH } from "../../accounts.config";
import type { Account } from "../../accounts.types";
import {
  applyModuleAccessChange,
  buildModuleAccessFromPermissions,
} from "../../../_shared/moduleAccess";

function accountRowStyle(record: Account): React.CSSProperties {
  if (record.status === "inactive") {
    return { color: "var(--mantine-color-gray-5)", };
  }
  if (record.status === "suspended") {
    return {
      color: "var(--mantine-color-red-6)",
    
     
    };
  }
  return {};
}

const TABS: DataTableShellTab[] = [
  { label: "All Accounts" },
  { label: "Active", filter: { status: "active" } },
  { label: "Inactive", filter: { status: "inactive" } },
];

export function AccountsList() {
  const [moduleAccess, setModuleAccess] = useState(() =>
    buildModuleAccessFromPermissions("accounts"),
  );

  const handleModuleAccessChange = useCallback(
    (change: DataTableShellModuleAccessChange) => {
      setModuleAccess((prev) => applyModuleAccessChange(prev, change));
    },
    [],
  );

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
        moduleAccess={moduleAccess}
        onModuleAccessChange={handleModuleAccessChange}
        rowStyle={accountRowStyle}
      />
    </Paper>
  );
}
