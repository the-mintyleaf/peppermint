"use client";

import { useState } from "react";
import { ActionIcon, Menu, Text, ThemeIcon } from "@peppermint/ui";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { ArrowsCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsCounterClockwise";
import { IdentificationBadgeIcon } from "@phosphor-icons/react/dist/csr/IdentificationBadge";
import { NodeChildrenPanel } from "../NodeChildrenPanel";
import type { InspectorPanelProps } from "./InspectorPanel.types";
import type {
  OrgOfficeData,
  DepartmentData,
  PersonData,
  GroupData,
} from "../../OrganizationTree.types";

const NODE_TYPE_META: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  org: {
    label: "Organization",
    color: "blue",
    icon: <BuildingsIcon size={13} aria-label="Organization" />,
  },
  department: {
    label: "Department",
    color: "violet",
    icon: <FolderIcon size={13} aria-label="Department" />,
  },
  person: {
    label: "Person",
    color: "teal",
    icon: <UserIcon size={13} aria-label="Person" />,
  },
  group: {
    label: "Group",
    color: "grape",
    icon: <StackIcon size={13} aria-label="Group" />,
  },
};

function getNodeName(
  node: NonNullable<InspectorPanelProps["selectedNode"]>,
): string {
  const d = node.data;
  if (d.nodeType === "person") return (d as PersonData).fullName;
  if (d.nodeType === "group") return (d as GroupData).name;
  return (d as OrgOfficeData | DepartmentData).name;
}

function InspectorPanelInner({
  onClose,
  selectedNode,
  onEdit,
  onDelete,
  onAddChild,
  onSelectNode,
  onFocusNode,
  nodes,
  edges,
}: Omit<InspectorPanelProps, "opened">) {
  const [expanded, setExpanded] = useState(true);

  const meta = NODE_TYPE_META[selectedNode!.type] ?? {
    label: selectedNode!.type,
    color: "gray",
    icon: null,
  };

  const nodeName = getNodeName(selectedNode!);

  // Collapsed → floating tab pinned to the right edge of the canvas
  if (!expanded) {
    return (
      <div
        style={{
          position: "absolute",
          top: "calc(16px + 40px)",
          right: 12,
          zIndex: 20,
          background: "var(--mantine-color-default)",
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          maxWidth: 240,
        }}
      >
        <ThemeIcon size="sm" variant="light" color={meta.color} radius="sm">
          {meta.icon}
        </ThemeIcon>
        <Text size="xs" fw={600} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
          {nodeName}
        </Text>
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          onClick={() => setExpanded(true)}
          aria-label="Expand inspector"
        >
          <CaretDownIcon size={12} />
        </ActionIcon>
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          onClick={onClose}
          aria-label="Close inspector"
        >
          <XIcon size={12} />
        </ActionIcon>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 420,
        flexShrink: 0,
        margin: 8,
        borderRadius: 12,
        border: "1px solid var(--mantine-color-default-border)",
        background: "var(--mantine-color-default)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--mantine-color-default-border)",
          flexShrink: 0,
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            minWidth: 0,
          }}
        >
          <ThemeIcon size="sm" variant="light" color={meta.color} radius="sm">
            {meta.icon}
          </ThemeIcon>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              size="xs"
              c="dimmed"
              fw={500}
              tt="uppercase"
              style={{ letterSpacing: "0.05em", fontSize: 10, lineHeight: 1.2 }}
            >
              {meta.label}
            </Text>
            <Text size="sm" fw={700} lineClamp={1}>
              {nodeName}
            </Text>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          {/* 3-dot actions menu */}
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                aria-label="Actions"
              >
                <DotsThreeVerticalIcon size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {selectedNode!.type === "org" && (
                <>
                  <Menu.Item
                    leftSection={
                      <PencilSimpleIcon size={13} aria-label="Edit" />
                    }
                    onClick={() => onEdit(selectedNode!.id)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <PlusIcon size={13} aria-label="Add division" />
                    }
                    onClick={() =>
                      onAddChild("department", selectedNode!.id, nodeName)
                    }
                  >
                    Add Division
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<MapPinIcon size={13} aria-label="Add site" />}
                    onClick={() =>
                      onAddChild(
                        "site",
                        selectedNode!.id,
                        nodeName,
                        selectedNode!.id,
                      )
                    }
                  >
                    Add Site
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <ArrowsCounterClockwiseIcon
                        size={13}
                        aria-label="Add delegation"
                      />
                    }
                    onClick={() =>
                      onAddChild(
                        "delegation",
                        selectedNode!.id,
                        nodeName,
                        selectedNode!.id,
                      )
                    }
                  >
                    Add Delegation
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<TrashIcon size={13} aria-label="Delete" />}
                    onClick={() => onDelete(selectedNode!.id)}
                  >
                    Delete
                  </Menu.Item>
                </>
              )}

              {selectedNode!.type === "department" && (
                <>
                  <Menu.Item
                    leftSection={
                      <PencilSimpleIcon size={13} aria-label="Edit" />
                    }
                    onClick={() => onEdit(selectedNode!.id)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <UserPlusIcon size={13} aria-label="Add person" />
                    }
                    onClick={() =>
                      onAddChild("person", selectedNode!.id, nodeName)
                    }
                  >
                    Add Person
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <PlusIcon size={13} aria-label="Add sub-unit" />
                    }
                    onClick={() =>
                      onAddChild("department", selectedNode!.id, nodeName)
                    }
                  >
                    Add Sub-unit
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IdentificationBadgeIcon
                        size={13}
                        aria-label="Add position"
                      />
                    }
                    onClick={() =>
                      onAddChild(
                        "position",
                        selectedNode!.id,
                        nodeName,
                        selectedNode!.id,
                      )
                    }
                  >
                    Add Position
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<TrashIcon size={13} aria-label="Delete" />}
                    onClick={() => onDelete(selectedNode!.id)}
                  >
                    Delete
                  </Menu.Item>
                </>
              )}

              {selectedNode!.type === "person" && (
                <>
                  <Menu.Item
                    leftSection={
                      <PencilSimpleIcon size={13} aria-label="Edit" />
                    }
                    onClick={() => onEdit(selectedNode!.id)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<TrashIcon size={13} aria-label="Remove" />}
                    onClick={() => onDelete(selectedNode!.id)}
                  >
                    Remove
                  </Menu.Item>
                </>
              )}

              {selectedNode!.type === "group" && (
                <Menu.Item
                  leftSection={<PencilSimpleIcon size={13} aria-label="Edit" />}
                  onClick={() => onEdit(selectedNode!.id)}
                >
                  Edit
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>

          {/* Collapse to floating tab */}
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={() => setExpanded(false)}
            aria-label="Collapse panel"
          >
            <CaretUpIcon size={14} />
          </ActionIcon>

          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={onClose}
            aria-label="Close inspector"
          >
            <XIcon size={14} />
          </ActionIcon>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <NodeChildrenPanel
          selectedNodeId={selectedNode!.id}
          selectedNodeType={selectedNode!.type}
          nodes={nodes}
          edges={edges}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectNode={onSelectNode}
          onFocusNode={onFocusNode}
        />
      </div>
    </div>
  );
}

export function InspectorPanel({
  opened,
  selectedNode,
  ...rest
}: InspectorPanelProps) {
  if (!opened || !selectedNode) return null;
  return (
    <InspectorPanelInner key={selectedNode.id} selectedNode={selectedNode} {...rest} />
  );
}
