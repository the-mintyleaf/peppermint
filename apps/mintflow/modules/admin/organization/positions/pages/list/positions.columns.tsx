"use client";

import type { DataTableShellColumn } from "@peppermint/admin";
import { ActionIcon, Badge, Group, Menu, Text } from "@peppermint/ui";
import { CrownIcon } from "@phosphor-icons/react/dist/csr/Crown";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { FingerprintIcon } from "@phosphor-icons/react/dist/csr/Fingerprint";
import { IdentificationBadgeIcon } from "@phosphor-icons/react/dist/csr/IdentificationBadge";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { StatusBadge } from "../../../_shared/StatusBadge";
import { POSITION_TYPE_LABELS } from "../../../organization.constants";
import type { Position } from "../../positions.types";

const DEACTIVATABLE = new Set(["active", "draft"]);

type OnDeactivate = (position: Position) => void;

export function getPositionsColumns(
  onDeactivate: OnDeactivate,
): DataTableShellColumn<Position>[] {
  return [
    {
      accessor: "title",
      title: "Title",
      icon: IdentificationBadgeIcon,
      sortable: true,
      width: 220,
    },
    {
      accessor: "code",
      title: "Code",
      icon: FingerprintIcon,
      sortable: true,
      width: 120,
    },
    {
      accessor: "position_type",
      title: "Type",
      icon: TagIcon,
      sortable: true,
      width: 160,
      render: (record) =>
        POSITION_TYPE_LABELS[record.position_type] ?? record.position_type,
    },
    {
      accessor: "status",
      title: "Status",
      icon: PulseIcon,
      width: 160,
      render: (record) => (
        <Group gap={6} wrap="nowrap">
          <StatusBadge status={record.status} size="xs" />
          {DEACTIVATABLE.has(record.status) && (
            <Menu withinPortal position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color="gray"
                  aria-label="Position actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DotsThreeVerticalIcon size={12} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeactivate(record);
                  }}
                >
                  Deactivate
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      ),
    },
    {
      accessor: "is_leadership",
      title: "Leadership",
      icon: CrownIcon,
      width: 110,
      render: (record) =>
        record.is_leadership ? (
          <Badge size="xs" color="blue">
            Yes
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        ),
    },
    {
      accessor: "is_supervisory",
      title: "Supervisory",
      icon: UsersThreeIcon,
      width: 110,
      render: (record) =>
        record.is_supervisory ? (
          <Badge size="xs" color="violet">
            Yes
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        ),
    },
  ];
}
