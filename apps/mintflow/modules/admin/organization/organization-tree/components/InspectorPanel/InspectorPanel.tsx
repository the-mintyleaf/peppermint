"use client";

import {
  ActionIcon,
  Divider,
  Menu,
  ScrollArea,
  Text,
  ThemeIcon,
} from "@peppermint/ui";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { OrgDrawerContent } from "../OrgDrawer/OrgDrawer";
import { DepartmentDrawerContent } from "../DepartmentDrawer/DepartmentDrawer";
import { PersonDrawerContent } from "../PersonDrawer/PersonDrawer";
import { GroupListContent } from "../GroupListDrawer/GroupListDrawer";
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

export function InspectorPanel({
  opened,
  onClose,
  selectedNode,
  onEdit,
  onDelete,
  onAddDivision,
  onAddPerson,
  onAddChild,
  totalPeople,
  totalDepts,
  hiddenLevels,
  headPersonName,
  healthIssues,
  directReports,
  totalBelow,
  memberNodes = [],
}: InspectorPanelProps) {
  if (!opened || !selectedNode) return null;

  const meta = NODE_TYPE_META[selectedNode.type] ?? {
    label: selectedNode.type,
    color: "gray",
    icon: null,
  };

  const nodeName =
    selectedNode.type === "person"
      ? (selectedNode.data as PersonData).fullName
      : selectedNode.type === "group"
        ? (selectedNode.data as GroupData).name
        : (selectedNode.data as OrgOfficeData | DepartmentData).name;

  return (
    <div
      style={{
        width: 480,
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
              {selectedNode.type === "org" && (
                <>
                  <Menu.Item
                    leftSection={
                      <PencilSimpleIcon size={13} aria-label="Edit" />
                    }
                    onClick={() => onEdit(selectedNode.id)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <PlusIcon size={13} aria-label="Add division" />
                    }
                    onClick={onAddDivision}
                  >
                    Add Division
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<TrashIcon size={13} aria-label="Delete" />}
                    onClick={() => onDelete(selectedNode.id)}
                  >
                    Delete
                  </Menu.Item>
                </>
              )}

              {selectedNode.type === "department" && (
                <>
                  <Menu.Item
                    leftSection={
                      <PencilSimpleIcon size={13} aria-label="Edit" />
                    }
                    onClick={() => onEdit(selectedNode.id)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <UserPlusIcon size={13} aria-label="Add person" />
                    }
                    onClick={onAddPerson}
                  >
                    Add Person
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <PlusIcon size={13} aria-label="Add sub-unit" />
                    }
                    onClick={onAddChild}
                  >
                    Add Sub-unit
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<TrashIcon size={13} aria-label="Delete" />}
                    onClick={() => onDelete(selectedNode.id)}
                  >
                    Delete
                  </Menu.Item>
                </>
              )}

              {selectedNode.type === "person" && (
                <>
                  <Menu.Item
                    leftSection={
                      <PencilSimpleIcon size={13} aria-label="Edit" />
                    }
                    onClick={() => onEdit(selectedNode.id)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<TrashIcon size={13} aria-label="Remove" />}
                    onClick={() => onDelete(selectedNode.id)}
                  >
                    Remove
                  </Menu.Item>
                </>
              )}

              {selectedNode.type === "group" && (
                <Menu.Item
                  leftSection={<PencilSimpleIcon size={13} aria-label="Edit" />}
                  onClick={() => onEdit(selectedNode.id)}
                >
                  Edit
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>

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
      <ScrollArea style={{ flex: 1 }}>
        <div style={{ padding: "0 0 24px" }}>
          {selectedNode.type === "org" && (
            <OrgDrawerContent
              nodeId={selectedNode.id}
              data={selectedNode.data as OrgOfficeData}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddDivision={onAddDivision}
              totalPeople={totalPeople}
              totalDepts={totalDepts}
              hiddenLevels={hiddenLevels}
              headPersonName={headPersonName}
              healthIssues={healthIssues}
            />
          )}
          {selectedNode.type === "department" && (
            <DepartmentDrawerContent
              nodeId={selectedNode.id}
              data={selectedNode.data as DepartmentData}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddPerson={onAddPerson}
              onAddChild={onAddChild}
              healthIssues={healthIssues}
              totalPeople={totalPeople}
              totalDepts={totalDepts}
              hiddenLevels={hiddenLevels}
            />
          )}
          {selectedNode.type === "person" && (
            <PersonDrawerContent
              nodeId={selectedNode.id}
              data={selectedNode.data as PersonData}
              onEdit={onEdit}
              onDelete={onDelete}
              healthIssues={healthIssues}
              directReports={directReports}
              totalBelow={totalBelow}
            />
          )}
          {selectedNode.type === "group" && (
            <GroupListContent
              nodeId={selectedNode.id}
              data={selectedNode.data as GroupData}
              memberNodes={memberNodes}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
