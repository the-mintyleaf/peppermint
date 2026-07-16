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
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { revokeDenial } from "./denials.api";
import { denialQueryKeys } from "./denials.queryKeys";
import type { Denial, DenialSeverity, DenialStatus } from "./denials.types";

const STATUS_COLOR: Record<DenialStatus, string> = {
  active: "green",
  revoked: "gray",
  expired: "orange",
};

const SEVERITY_COLOR: Record<DenialSeverity, string> = {
  low: "gray",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

function RevokeDenialAction({ record }: { record: Denial }) {
  const queryClient = useQueryClient();

  const revokeMutation = useMutation({
    mutationFn: () => revokeDenial(record.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: denialQueryKeys.list().split("."),
      });
      notifications.show({
        color: "green",
        title: "Denial revoked",
        message: "The denial no longer applies.",
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't revoke denial",
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
      title: "Revoke denial",
      children: (
        <Text size="sm">
          This denial will stop blocking access immediately. This action cannot
          be undone.
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

export const denialsColumns: DataTableShellColumn<Denial>[] = [
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
    render: (record) => <Text size="xs">{record.reason}</Text>,
  },
  {
    accessor: "severity",
    title: "Severity",
    icon: WarningIcon,
    sortable: true,
    render: (record) => (
      <Badge size="xs" color={SEVERITY_COLOR[record.severity]}>
        {record.severity}
      </Badge>
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
    render: (record) => <RevokeDenialAction record={record} />,
  },
];
