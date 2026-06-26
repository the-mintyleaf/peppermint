import type { DataTableShellColumn } from "@peppermint/admin";
import { Badge, Group, Text } from "@peppermint/ui";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { CalendarCheckIcon } from "@phosphor-icons/react/dist/csr/CalendarCheck";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { StatusBadge } from "../../../_shared/StatusBadge";
import { DELEGATION_TYPE_LABELS } from "../../../organization.constants";
import type { Delegation, DelegationStatus } from "../../delegations.types";

const REVOCABLE = new Set<DelegationStatus>(["planned", "active"]);

type OnRevoke = (delegation: Delegation) => void;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getDelegationsColumns(
  onRevoke: OnRevoke,
): DataTableShellColumn<Delegation>[] {
  return [
    {
      accessor: "from_assignment_label",
      title: "From",
      icon: UserIcon,
      sortable: false,
      render: (record) => (
        <Text size="xs">
          {record.from_assignment_label ?? record.from_assignment}
        </Text>
      ),
    },
    {
      accessor: "to_assignment_label",
      title: "To",
      icon: ArrowsLeftRightIcon,
      sortable: false,
      render: (record) => (
        <Text size="xs">
          {record.to_assignment_label ?? record.to_assignment}
        </Text>
      ),
    },
    {
      accessor: "delegation_type",
      title: "Type",
      icon: ShieldCheckIcon,
      render: (record) => (
        <Text size="xs">
          {DELEGATION_TYPE_LABELS[record.delegation_type] ??
            record.delegation_type}
        </Text>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      icon: PulseIcon,
      render: (record) => (
        <Group gap={4} wrap="nowrap">
          <StatusBadge status={record.status} />
          {REVOCABLE.has(record.status) && (
            <Badge
              size="xs"
              variant="transparent"
              color="gray"
              style={{ cursor: "pointer", padding: "2px 4px" }}
              onClick={(e) => {
                e.stopPropagation();
                onRevoke(record);
              }}
              aria-label="Revoke delegation options"
            >
              <DotsThreeVerticalIcon size={14} weight="bold" aria-hidden />
            </Badge>
          )}
        </Group>
      ),
    },
    {
      accessor: "starts_at",
      title: "Starts",
      icon: CalendarIcon,
      render: (record) => <Text size="xs">{formatDate(record.starts_at)}</Text>,
    },
    {
      accessor: "ends_at",
      title: "Ends",
      icon: CalendarCheckIcon,
      render: (record) => <Text size="xs">{formatDate(record.ends_at)}</Text>,
    },
  ];
}
