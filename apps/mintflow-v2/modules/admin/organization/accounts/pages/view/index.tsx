"use client";

import { useParams } from "next/navigation";
import { Paper } from "@peppermint/ui";
import { useQuery } from "@peppermint/ui";
import { fetchAccount } from "../../accounts.api";
import { AccountView } from "./AccountView";

export function AccountsView() {
  const { id } = useParams<{ id: string }>();

  const { data: account } = useQuery({
    queryKey: ["org.account", id],
    queryFn: () => fetchAccount(id),
    enabled: !!id,
  });

  if (!account) return null;

  return (
    <Paper p={0} withBorder radius="md" h="calc(100vh - 16px)" style={{ overflowY: "auto" }}>
      <AccountView account={account} />
    </Paper>
  );
}
