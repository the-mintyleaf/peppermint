"use client";

import { useParams } from "next/navigation";
import { Paper } from "@peppermint/ui";
import { useQuery } from "@peppermint/ui";
import { AccountForm } from "../../form";
import { fetchAccount } from "../../accounts.api";

export function AccountsEdit() {
  const { id } = useParams<{ id: string }>();

  const { data: account } = useQuery({
    queryKey: ["org.account", id],
    queryFn: () => fetchAccount(id),
    enabled: !!id,
  });

  return (
    <Paper p={0} withBorder radius="md" h="calc(100vh - 16px)">
      <AccountForm
        onBack={() => history.back()}
        initialValues={account}
      />
    </Paper>
  );
}
