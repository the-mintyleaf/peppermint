"use client";

import type { DataTableShellColumn } from "@peppermint/admin";
import { ActionIcon, Badge, Group, Menu, Text } from "@peppermint/ui";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { FingerprintIcon } from "@phosphor-icons/react/dist/csr/Fingerprint";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { PersonPositionChip } from "../../../_shared/PersonPositionChip";
import { StatusBadge } from "../../../_shared/StatusBadge";
import {
  getMembershipStatusActionLabel,
  MEMBERSHIP_STATUS_TRANSITIONS,
} from "../../people.constants";
import type { MembershipStatus, Person } from "../../people.types";

type OnOpenProfile = (person: Person) => void;
type OnStatusChange = (person: Person, newStatus: MembershipStatus) => void;

export function getPeopleColumns(
  onOpenProfile: OnOpenProfile,
  onStatusChange: OnStatusChange,
): DataTableShellColumn<Person>[] {
  return [
    {
      accessor: "user_display_name",
      title: "Person",
      icon: UserIcon,
      sortable: true,
      width: 260,
      render: (record) => (
        <PersonPositionChip
          personName={record.user_display_name}
          positionTitle={record.user_email}
          employeeCode={record.employee_code || undefined}
          size="sm"
          onClick={() => onOpenProfile(record)}
        />
      ),
    },
    {
      accessor: "user_email",
      title: "Email",
      icon: EnvelopeIcon,
      sortable: true,
      width: 220,
    },
    {
      accessor: "employee_code",
      title: "Employee Code",
      icon: FingerprintIcon,
      sortable: true,
      width: 140,
    },
    {
      accessor: "membership_status",
      title: "Status",
      icon: PulseIcon,
      width: 180,
      render: (record) => {
        const transitions =
          MEMBERSHIP_STATUS_TRANSITIONS[record.membership_status] ?? [];
        return (
          <Group gap={6} wrap="nowrap">
            <StatusBadge status={record.membership_status} size="xs" />
            {transitions.length > 0 && (
              <Menu withinPortal position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="gray"
                    aria-label="Change membership status"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DotsThreeVerticalIcon size={12} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>
                    <Group gap={4}>
                      <ArrowsClockwiseIcon size={12} />
                      Change Status
                    </Group>
                  </Menu.Label>
                  {transitions.map((s) => (
                    <Menu.Item
                      key={s}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(record, s);
                      }}
                    >
                      {getMembershipStatusActionLabel(s)}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        );
      },
    },
    {
      accessor: "is_primary",
      title: "Primary",
      icon: StarIcon,
      width: 100,
      render: (record) =>
        record.is_primary ? (
          <Badge size="xs" color="blue" variant="light">
            Yes
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">
            No
          </Text>
        ),
    },
    {
      accessor: "joined_at",
      title: "Joined",
      icon: CalendarBlankIcon,
      sortable: true,
      width: 140,
      render: (record) =>
        record.joined_at ? (
          <Text size="xs">
            {new Date(record.joined_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        ),
    },
  ];
}
