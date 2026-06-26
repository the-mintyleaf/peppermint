"use client";

import { useState } from "react";
import { ActionIcon, Badge, Group, Menu, Text, ThemeIcon } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";

import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { UserSwitchIcon } from "@phosphor-icons/react/dist/csr/UserSwitch";
import { computeDirectChildren } from "../../NodeChildrenPanel.utils";
import { STATUS_COLORS } from "../../../../OrganizationTree.utils";
import type {
  OrgOfficeData,
  DepartmentData,
  PersonData,
  ExtendedNodeType,
} from "../../../../OrganizationTree.types";
import type {
  ChildrenTreeNodeProps,
  ChildrenTreeProps,
} from "./ChildrenTree.types";

const ADD_OPTIONS: Record<
  string,
  { type: ExtendedNodeType; label: string; icon: React.ReactNode }[]
> = {
  org: [
    { type: "department", label: "Department", icon: <FolderIcon size={13} /> },
    { type: "person", label: "Person", icon: <UserIcon size={13} /> },
  ],
  department: [
    { type: "department", label: "Sub-unit", icon: <FolderIcon size={13} /> },
    { type: "person", label: "Person", icon: <UserIcon size={13} /> },
  ],
  person: [
    { type: "person", label: "Direct Report", icon: <UserIcon size={13} /> },
  ],
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  org: <BuildingsIcon size={12} weight="fill" aria-label="Organization" />,
  department: <FolderIcon size={12} weight="fill" aria-label="Department" />,
  person: <UserIcon size={12} weight="fill" aria-label="Person" />,
  group: <StackIcon size={12} weight="fill" aria-label="Group" />,
};

const TYPE_COLOR: Record<string, string> = {
  org: "blue",
  department: "violet",
  person: "teal",
  group: "grape",
};

function getNodeName(node: ChildrenTreeNodeProps["node"]): string {
  const d = node.data;
  if (d.nodeType === "person") return (d as PersonData).fullName;
  return (d as OrgOfficeData | DepartmentData).name;
}

function getNodeStatus(node: ChildrenTreeNodeProps["node"]): string {
  return (node.data as { status: string }).status ?? "active";
}

function TreeNode({
  node,
  depth,
  nodes,
  edges,
  onEdit,
  onDelete,
  onFocusNode,
  onAddChild,
}: ChildrenTreeNodeProps) {
  const [hovered, setHovered] = useState(false);
  const directChildren = computeDirectChildren(node.id, nodes, edges);
  const hasChildren = directChildren.length > 0;
  const [expanded, setExpanded] = useState(depth === 0);

  const name = getNodeName(node);
  const status = getNodeStatus(node);
  const color = TYPE_COLOR[node.type ?? ""] ?? "gray";
  const icon = TYPE_ICON[node.type ?? ""] ?? (
    <FolderIcon size={12} weight="fill" aria-label="Node" />
  );

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          paddingLeft: depth * 16 + 12,
          paddingRight: 8,
          paddingTop: 5,
          paddingBottom: 5,
          borderRadius: 6,
          background: hovered
            ? "var(--mantine-color-default-hover)"
            : "transparent",
          transition: "background 100ms",
        }}
      >
        {/* Expand toggle */}
        <div
          style={{
            width: 16,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            cursor: "pointer"
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded((v) => !v);
          }}
        >
          {hasChildren ? (
            expanded ? (
              <CaretDownIcon weight="bold" size={11} color="var(--mantine-color-dimmed)" />
            ) : (
              <CaretRightIcon weight="bold" size={11} color="var(--mantine-color-dimmed)" />
            )
          ) : null}
        </div>

        {/* Node icon */}
        <ThemeIcon size="xs" color={color} variant="subtle" radius={5}>
          {icon}
        </ThemeIcon>

        {/* Name */}
        <Text
          size="xs"
          fw={500}
          lineClamp={1}
          style={{ flex: 1, minWidth: 0, opacity: status === "active" ? 1 : 0.45 }}
        >
          {name}
        </Text>

        {/* Status + actions */}
        <Group
          gap={4}
          style={{ flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {status !== "active" && (
            <Badge
              size="xs"
              color={STATUS_COLORS[status] ?? "gray"}
              variant="light"
              style={{ visibility: hovered ? "visible" : "hidden" }}
            >
              {status}
            </Badge>
          )}
          <div style={{ display: "flex", gap: 4, visibility: hovered ? "visible" : "hidden" }}>
            {(ADD_OPTIONS[node.type ?? ""] ?? []).length > 0 && (
              <Menu withinPortal position="bottom-end" shadow="sm" width={160}>
                <Menu.Target>
                  <ActionIcon size="xs" variant="subtle" color="gray" aria-label="Add child">
                    <PlusIcon size={12} weight="bold" />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {(ADD_OPTIONS[node.type ?? ""] ?? []).map((opt) => (
                    <Menu.Item
                      key={opt.type}
                      leftSection={opt.icon}
                      onClick={() => onAddChild(opt.type, node.id, name)}
                    >
                      {opt.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}
            <Menu withinPortal position="bottom-end" shadow="sm" width={160}>
              <Menu.Target>
                <ActionIcon size="xs" variant="subtle" color="gray" aria-label="More actions">
                  <DotsThreeVerticalIcon size={13} weight="bold" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<EyeIcon size={13} />}
                  onClick={() => onFocusNode(node.id)}
                >
                  Focus in diagram
                </Menu.Item>
                <Menu.Item
                  leftSection={<PencilSimpleIcon size={13} />}
                  onClick={() => onEdit(node.id)}
                >
                  Edit
                </Menu.Item>
                {node.type === "person" && (
                  <Menu.Item
                    leftSection={<UserSwitchIcon size={13} />}
                    onClick={() => onAddChild("delegation", node.id, name)}
                  >
                    Delegate to...
                  </Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item
                  leftSection={<TrashIcon size={13} />}
                  color="red"
                  onClick={() => onDelete(node.id)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </Group>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {directChildren.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              nodes={nodes}
              edges={edges}
              onEdit={onEdit}
              onDelete={onDelete}
              onFocusNode={onFocusNode}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChildrenTree({
  rootNodeId,
  nodes,
  edges,
  onEdit,
  onDelete,
  onFocusNode,
  onAddChild,
}: ChildrenTreeProps) {
  const directChildren = computeDirectChildren(rootNodeId, nodes, edges);

  if (directChildren.length === 0) {
    return (
      <div
        style={{
          padding: "24px 12px",
          textAlign: "center",
          border: "1px dashed var(--mantine-color-default-border)",
          borderRadius: 0,
        }}
      >
        <Text size="sm" c="dimmed">
          No children to show
        </Text>
      </div>
    );
  }

  return (
    <div>
      {directChildren.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={0}
          nodes={nodes}
          edges={edges}
          onEdit={onEdit}
          onDelete={onDelete}
          onFocusNode={onFocusNode}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}
