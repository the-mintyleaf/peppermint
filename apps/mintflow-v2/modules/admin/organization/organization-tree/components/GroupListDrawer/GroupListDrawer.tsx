"use client";

import { Badge, Button, Drawer, Group, Stack, Text, ThemeIcon } from "@peppermint/ui";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { ArrowsOutIcon } from "@phosphor-icons/react/dist/csr/ArrowsOut";
import type { GroupData } from "../../OrganizationTree.types";
import type { OrgFlowNode } from "../../OrganizationTree.store";
import { useOrgTreeStore } from "../../OrganizationTree.store";

interface GroupListDrawerProps {
  opened: boolean;
  onClose: () => void;
  nodeId: string;
  data: GroupData;
  memberNodes: OrgFlowNode[];
}

type GroupListContentProps = Omit<GroupListDrawerProps, "opened" | "onClose">;

export function GroupListContent({ nodeId, data, memberNodes }: GroupListContentProps) {
  const { expandGroup, expandNode, closeDrawer } = useOrgTreeStore();

  function handleExpandAll() {
    expandGroup(nodeId, []);
    expandNode(nodeId);
    closeDrawer();
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          {data.memberCount} {data.groupCategory === "person" ? "people" : "offices"} in this group
        </Text>
        <Button
          size="xs"
          variant="light"
          color="violet"
          leftSection={<ArrowsOutIcon size={13} aria-label="Expand" />}
          onClick={handleExpandAll}
        >
          Expand on canvas
        </Button>
      </Group>

      <Stack gap={4}>
        {memberNodes.length === 0 && (
          <Text size="xs" c="dimmed" ta="center" py="md">
            No member details available. Expand the group to load members.
          </Text>
        )}
        {memberNodes.map((node) => {
          const name =
            node.data.nodeType === "person"
              ? (node.data as { fullName: string }).fullName
              : node.data.nodeType === "department"
              ? (node.data as { name: string }).name
              : node.id;

          const subtitle =
            node.data.nodeType === "person"
              ? (node.data as { designation: string }).designation
              : node.data.nodeType === "department"
              ? (node.data as { deptType?: string }).deptType ?? ""
              : "";

          return (
            <div
              key={node.id}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid var(--mantine-color-default-border)",
              }}
            >
              <Text size="xs" fw={600} lineClamp={1}>{name}</Text>
              {subtitle && <Text size="xs" c="dimmed">{subtitle}</Text>}
            </div>
          );
        })}
        {data.memberCount > memberNodes.length && (
          <Text size="xs" c="dimmed" ta="center" pt={4}>
            + {data.memberCount - memberNodes.length} more · expand group to see all
          </Text>
        )}
      </Stack>
    </Stack>
  );
}

export function GroupListDrawer({ opened, onClose, ...rest }: GroupListDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size="sm" variant="light" color="violet">
            <StackIcon size={14} aria-label="Group" />
          </ThemeIcon>
          <Text fw={600} size="sm">{rest.data.name}</Text>
          <Badge size="sm" color="violet" variant="light">{rest.data.memberCount}</Badge>
        </Group>
      }
      position="right"
      size="sm"
      padding="md"
    >
      <GroupListContent {...rest} />
    </Drawer>
  );
}
