"use client";

import { useState } from "react";
import { ActionIcon, Badge, Group, Stack, Text } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { STATUS_COLORS } from "../../../../OrganizationTree.utils";
import type {
  OrgOfficeData,
  DepartmentData,
  PersonData,
} from "../../../../OrganizationTree.types";
import type { ChildCardProps } from "./ChildCard.types";

const TYPE_META: Record<
  string,
  { icon: React.ReactNode; color: string; label: string }
> = {
  org: {
    icon: <BuildingsIcon size={13} aria-label="Organization" />,
    color: "blue",
    label: "Org",
  },
  department: {
    icon: <FolderIcon size={13} aria-label="Department" />,
    color: "violet",
    label: "Unit",
  },
  person: {
    icon: <UserIcon size={13} aria-label="Person" />,
    color: "teal",
    label: "Person",
  },
  group: {
    icon: <StackIcon size={13} aria-label="Group" />,
    color: "grape",
    label: "Group",
  },
};

function getNodeName(node: ChildCardProps["node"]): string {
  const d = node.data;
  if (d.nodeType === "person") return (d as PersonData).fullName;
  return (d as OrgOfficeData | DepartmentData).name;
}

function getNodeSubtitle(node: ChildCardProps["node"]): string | undefined {
  const d = node.data;
  if (d.nodeType === "department") return (d as DepartmentData).deptType;
  if (d.nodeType === "person") {
    const p = d as PersonData;
    return [p.role, p.designation].filter(Boolean).join(" · ");
  }
  if (d.nodeType === "org") return (d as OrgOfficeData).orgType;
  return undefined;
}

function getNodeStatus(node: ChildCardProps["node"]): string {
  return (node.data as { status: string }).status ?? "active";
}

export function ChildCard({
  node,
  onEdit,
  onDelete,
  onSelect,
}: ChildCardProps) {
  const [hovered, setHovered] = useState(false);
  const meta = TYPE_META[node.type ?? ""] ?? TYPE_META.department;
  const name = getNodeName(node);
  const subtitle = getNodeSubtitle(node);
  const status = getNodeStatus(node);

  const isDepartment = node.type === "department";
  const isInactive = status !== "active";

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(node.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(node.id);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid var(--mantine-color-default-border)",
        background: hovered
          ? "var(--mantine-color-default-hover)"
          : "var(--mantine-color-default)",
        cursor: "pointer",
        transition: "background 120ms",
        gap: 8,
        ...(isDepartment && isInactive
          ? { filter: "saturate(0)", opacity: 0.5 }
          : {}),
      }}
    >
      <Group gap={10} style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: `var(--mantine-color-${meta.color}-1)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: `var(--mantine-color-${meta.color}-7)`,
          }}
        >
          {meta.icon}
        </div>
        <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600} lineClamp={1}>
            {name}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed" lineClamp={1} tt="capitalize">
              {subtitle}
            </Text>
          )}
        </Stack>
      </Group>

      <Group
        gap={6}
        style={{ flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {(!isDepartment || isInactive) && (
          <Badge
            size="xs"
            color={STATUS_COLORS[status] ?? "gray"}
            variant="light"
          >
            {status}
          </Badge>
        )}
        {hovered && (
          <>
            <ActionIcon
              size="xs"
              variant="subtle"
              color="gray"
              aria-label="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node.id);
              }}
            >
              <PencilSimpleIcon size={12} />
            </ActionIcon>
            <ActionIcon
              size="xs"
              variant="subtle"
              color="red"
              aria-label="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
            >
              <TrashIcon size={12} />
            </ActionIcon>
          </>
        )}
      </Group>
    </div>
  );
}
