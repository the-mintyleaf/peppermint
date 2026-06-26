"use client";

import { useState } from "react";
import {
  ActionIcon,
  Divider,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@peppermint/ui";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { ChildGroupSection } from "./components/ChildGroupSection";
import { ChildrenTree } from "./components/ChildrenTree";
import { computeDirectChildren } from "./NodeChildrenPanel.utils";
import type {
  OrgOfficeData,
  DepartmentData,
} from "../../OrganizationTree.types";
import type { NodeChildrenPanelProps } from "./NodeChildrenPanel.types";

type ViewMode = "grouped" | "tree";

// Which sections to show for each parent node type
const SECTION_CONFIG: Record<
  string,
  { childType: string; label: string; addLabel: string; addType: string }[]
> = {
  org: [
    {
      childType: "department",
      label: "Departments",
      addLabel: "Add Department",
      addType: "department",
    },
    {
      childType: "person",
      label: "People",
      addLabel: "Add Person",
      addType: "person",
    },
  ],
  department: [
    {
      childType: "department",
      label: "Sub-units",
      addLabel: "Add Sub-unit",
      addType: "department",
    },
    {
      childType: "person",
      label: "People",
      addLabel: "Add Person",
      addType: "person",
    },
  ],
  person: [
    {
      childType: "person",
      label: "Direct Reports",
      addLabel: "Add Person",
      addType: "person",
    },
  ],
  group: [],
};

function getNodeName(
  nodes: NodeChildrenPanelProps["nodes"],
  nodeId: string,
): string {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return "";
  const d = node.data;
  if (d.nodeType === "person") return (d as { fullName: string }).fullName;
  return (d as OrgOfficeData | DepartmentData).name;
}

export function NodeChildrenPanel({
  selectedNodeId,
  selectedNodeType,
  nodes,
  edges,
  onAddChild,
  onEdit,
  onDelete,
  onSelectNode,
  onFocusNode,
}: NodeChildrenPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");

  const directChildren = computeDirectChildren(selectedNodeId, nodes, edges);
  const sections = SECTION_CONFIG[selectedNodeType] ?? [];
  const parentName = getNodeName(nodes, selectedNodeId);

  return (
    <Stack gap={0} style={{ height: "100%" }}>
      {/* View toggle header */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--mantine-color-default-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text size="xs" c="dimmed" fw={500}>
          {directChildren.length} child
          {directChildren.length !== 1 ? "ren" : ""}
        </Text>
        <Group gap={4}>
          <Tooltip label="Grouped view" fz="xs">
            <ActionIcon
              size="sm"
              variant={viewMode === "grouped" ? "light" : "subtle"}
              color={viewMode === "grouped" ? "blue" : "gray"}
              onClick={() => setViewMode("grouped")}
              aria-label="Grouped view"
            >
              <SquaresFourIcon size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Tree view" fz="xs">
            <ActionIcon
              size="sm"
              variant={viewMode === "tree" ? "light" : "subtle"}
              color={viewMode === "tree" ? "blue" : "gray"}
              onClick={() => setViewMode("tree")}
              aria-label="Tree view"
            >
              <TreeStructureIcon size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", }}>
        {viewMode === "grouped" ? (
          <Stack gap={20} p="md">
            {sections.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" mt="lg">
                No child views available for this node type.
              </Text>
            )}
            {sections.map((section) => {
              const sectionChildren = directChildren.filter(
                (n) => n.type === section.childType,
              );
              return (
                <ChildGroupSection
                  key={section.childType}
                  label={section.label}
                  addLabel={section.addLabel}
                  children={sectionChildren}
                  onAdd={() =>
                    onAddChild(
                      section.addType as Parameters<typeof onAddChild>[0],
                      selectedNodeId,
                      parentName,
                    )
                  }
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSelectNode={onSelectNode}
                />
              );
            })}

            {/* Divider + non-canvas quick actions for org/dept */}
            {(selectedNodeType === "org" ||
              selectedNodeType === "department") && (
              <>
                <Divider
                  label={
                    <Text size="xs" c="dimmed" fw={500}>
                      Quick actions
                    </Text>
                  }
                  labelPosition="left"
                />
                <Stack gap={6}>
                  {selectedNodeType === "org" && (
                    <>
                      <ActionRow
                        label="Add Site"
                        onClick={() =>
                          onAddChild(
                            "site",
                            selectedNodeId,
                            parentName,
                            selectedNodeId,
                          )
                        }
                      />
                      <ActionRow
                        label="Add Delegation"
                        onClick={() =>
                          onAddChild(
                            "delegation",
                            selectedNodeId,
                            parentName,
                            selectedNodeId,
                          )
                        }
                      />
                    </>
                  )}
                  {selectedNodeType === "department" && (
                    <ActionRow
                      label="Add Position"
                      onClick={() =>
                        onAddChild(
                          "position",
                          selectedNodeId,
                          parentName,
                          selectedNodeId,
                        )
                      }
                    />
                  )}
                </Stack>
              </>
            )}
          </Stack>
        ) : (
          <ChildrenTree
            rootNodeId={selectedNodeId}
            nodes={nodes}
            edges={edges}
            onEdit={onEdit}
            onDelete={onDelete}
            onFocusNode={onFocusNode}
            onAddChild={(type, parentId, parentName) =>
              onAddChild(type, parentId, parentName)
            }
          />
        )}
      </div>
    </Stack>
  );
}

function ActionRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "7px 10px",
        borderRadius: 6,
        border: "1px dashed var(--mantine-color-default-border)",
        background: "transparent",
        cursor: "pointer",
        fontSize: 12,
        color: "var(--mantine-color-dimmed)",
        transition: "background 100ms, color 100ms",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--mantine-color-default-hover)";
        (e.currentTarget as HTMLButtonElement).style.color =
          "var(--mantine-color-text)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color =
          "var(--mantine-color-dimmed)";
      }}
    >
      + {label}
    </button>
  );
}
