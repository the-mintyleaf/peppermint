"use client";

import {
  Badge,
  Button,
  Text,
  modals,
  notifications,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { NoteIcon } from "@phosphor-icons/react/dist/csr/Note";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { revokeGrant } from "./grants.api";
import { grantQueryKeys } from "./grants.queryKeys";
import type { Grant, GrantStatus } from "./grants.types";

const STATUS_COLOR: Record<GrantStatus, string> = {
  active: "green",
  revoked: "gray",
  expired: "orange",
};

function RevokeGrantAction({ record }: { record: Grant }) {
  const queryClient = useQueryClient();

  const revokeMutation = useMutation({
    mutationFn: () => revokeGrant(record.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: grantQueryKeys.list().split("."),
      });
      notifications.show({
        color: "green",
        title: "Grant revoked",
        message: "The grant no longer applies.",
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't revoke grant",
        message: getApiErrorMessage(error),
      });
    },
  });

  if (record.status !== "active") {
    return (
      <Text size="xs" c="dimmed">
        —
      </Text>
    );
  }

  const requestRevoke = () =>
    modals.openConfirmModal({
      title: "Revoke grant",
      children: (
        <Text size="sm">
          This grant will stop applying immediately. This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Revoke", cancel: "Cancel" },
      confirmProps: { color: "red", size: "xs" },
      cancelProps: { size: "xs" },
      onConfirm: () => revokeMutation.mutate(),
    });

  return (
    <Button
      size="compact-xs"
      variant="light"
      color="red"
      loading={revokeMutation.isPending}
      onClick={requestRevoke}
    >
      Revoke
    </Button>
  );
}

export const grantsColumns: DataTableShellColumn<Grant>[] = [
  {
    accessor: "subject_user",
    title: "User",
    icon: UserIcon,
    render: (record) => (
      <Text size="xs">
        {record.subject_user?.display_name ??
          record.subject_user?.username ??
          "—"}
      </Text>
    ),
  },
  {
    accessor: "permission_key",
    title: "Permission",
    icon: KeyIcon,
    sortable: true,
  },
  {
    accessor: "scope_type",
    title: "Scope",
    icon: GlobeIcon,
    sortable: true,
  },
  {
    accessor: "reason",
    title: "Reason",
    icon: NoteIcon,
    render: (record) => (
      <Text size="xs" c={record.reason ? undefined : "dimmed"}>
        {record.reason ?? "—"}
      </Text>
    ),
  },
  {
    accessor: "status",
    title: "Status",
    icon: PulseIcon,
    render: (record) => (
      <Badge size="xs" color={STATUS_COLOR[record.status]}>
        {record.status}
      </Badge>
    ),
  },
  {
    accessor: "id",
    key: "actions",
    title: "Actions",
    icon: ProhibitIcon,
    render: (record) => <RevokeGrantAction record={record} />,
  },
];
