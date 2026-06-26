"use client";

import type { DataTableShellColumn } from "@peppermint/admin";
import { ActionIcon, Button, Group, Menu } from "@peppermint/ui";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { FingerprintIcon } from "@phosphor-icons/react/dist/csr/Fingerprint";
import { GearIcon } from "@phosphor-icons/react/dist/csr/Gear";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { StatusBadge } from "../../../_shared/StatusBadge";
import {
  ORGANIZATION_STATUS_LABELS,
  ORGANIZATION_TYPE_LABELS,
} from "../../../organization.constants";
import type {
  Organization,
  OrganizationStatus,
} from "../../organizations.types";

const STATUS_TRANSITIONS: Record<OrganizationStatus, OrganizationStatus[]> = {
  draft: ["active", "archived"],
  active: ["inactive", "suspended", "archived"],
  inactive: ["active", "archived"],
  suspended: ["active", "inactive", "archived"],
  archived: [],
};

type OnStatusChange = (
  org: Organization,
  newStatus: OrganizationStatus,
) => void;
type OnManage = (org: Organization) => void;

export function getOrganizationsColumns(
  onStatusChange: OnStatusChange,
  onManage: OnManage,
): DataTableShellColumn<Organization>[] {
  return [
    {
      accessor: "name",
      title: "Name",
      icon: BuildingsIcon,
      sortable: true,
      width: 240,
    },
    {
      accessor: "code",
      title: "Code",
      icon: FingerprintIcon,
      sortable: true,
      width: 120,
    },
    {
      accessor: "organization_type",
      title: "Type",
      icon: TagIcon,
      sortable: true,
      width: 160,
      render: (record) =>
        ORGANIZATION_TYPE_LABELS[record.organization_type] ??
        record.organization_type,
    },
    {
      accessor: "country_code",
      title: "Country",
      icon: GlobeIcon,
      sortable: true,
      width: 100,
    },
    {
      accessor: "status",
      title: "Status",
      icon: PulseIcon,
      width: 160,
      render: (record) => {
        const transitions = STATUS_TRANSITIONS[record.status] ?? [];
        return (
          <Group gap={6} wrap="nowrap">
            <StatusBadge status={record.status} size="xs" />
            {transitions.length > 0 && (
              <Menu withinPortal position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="gray"
                    aria-label="Change organization status"
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
                      {ORGANIZATION_STATUS_LABELS[s]}
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
      accessor: "created_at",
      title: "Created",
      icon: CalendarBlankIcon,
      sortable: true,
      width: 160,
      render: (record) =>
        new Date(record.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      accessor: "id",
      title: "Actions",
      icon: GearIcon,
      width: 140,
      render: (record) => (
        <Button
          size="xs"
          variant="light"
          leftSection={<BuildingsIcon size={12} />}
          onClick={(e) => {
            e.stopPropagation();
            onManage(record);
          }}
        >
          Manage
        </Button>
      ),
    },
  ];
}
