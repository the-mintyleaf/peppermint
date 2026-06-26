"use client";

import {
  Drawer,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Divider,
  Avatar,
  ActionIcon,
  Tooltip,
  ThemeIcon,
  ScrollArea,
} from "@peppermint/ui";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import type { DepartmentDrawerProps } from "./DepartmentDrawer.types";
import styles from "../../OrganizationBuilder.module.css";

const STATUS_COLORS: Record<string, string> = {
  active: "teal",
  inactive: "gray",
  archived: "red",
};

export function DepartmentDrawer({
  opened,
  onClose,
  nodeId,
  data,
  onEdit,
  onDelete,
  onAddPerson,
  onAddChild,
}: DepartmentDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" color="violet" variant="light">
            <FolderIcon size={18} weight="fill" aria-label="Department" />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={700} size="sm">
              {data.name}
            </Text>
            <Text size="xs" c="dimmed" tt="capitalize">
              {data.deptType}
            </Text>
          </Stack>
        </Group>
      }
      styles={{
        body: { padding: 0 },
        header: {
          padding: "16px 20px 12px",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        },
      }}
    >
      <ScrollArea h="calc(100vh - 80px)" p="md">
        <Stack gap="md">
          {/* Status & quick badges */}
          <Group gap="sm">
            <Badge color={STATUS_COLORS[data.status]} variant="light" size="sm">
              {data.status}
            </Badge>
            <Badge color="violet" variant="dot" size="sm">
              {data.deptType}
            </Badge>
          </Group>

          {/* Description */}
          {data.description && (
            <div className={styles.drawerSection}>
              <Text
                size="xs"
                fw={600}
                c="dimmed"
                mb={6}
                tt="uppercase"
                style={{ letterSpacing: "0.05em" }}
              >
                Description
              </Text>
              <Text size="sm">{data.description}</Text>
            </div>
          )}

          {/* Hierarchy */}
          <div className={styles.drawerSection}>
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              mb={8}
              tt="uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              Hierarchy
            </Text>
            <Stack gap="xs">
              {data.parentName && (
                <Group gap="xs" justify="space-between">
                  <Text size="xs" c="dimmed">
                    Parent
                  </Text>
                  <Badge variant="outline" size="xs" color="gray">
                    {data.parentName}
                  </Badge>
                </Group>
              )}
              {data.childDeptNames && data.childDeptNames.length > 0 && (
                <Group gap="xs" justify="space-between" align="flex-start">
                  <Text size="xs" c="dimmed">
                    Children
                  </Text>
                  <Group
                    gap={4}
                    wrap="wrap"
                    justify="flex-end"
                    style={{ maxWidth: "60%" }}
                  >
                    {data.childDeptNames.map((name) => (
                      <Badge
                        key={name}
                        variant="outline"
                        size="xs"
                        color="violet"
                      >
                        {name}
                      </Badge>
                    ))}
                  </Group>
                </Group>
              )}
              {data.head && (
                <Group gap="xs" justify="space-between">
                  <Text size="xs" c="dimmed">
                    Head
                  </Text>
                  <Text size="xs" fw={600}>
                    {data.head}
                  </Text>
                </Group>
              )}
            </Stack>
          </div>

          {/* Stats */}
          <Group gap="xs" grow>
            <div className={styles.statBadge}>
              <Text size="lg" fw={700} c="violet">
                {data.peopleCount ?? 0}
              </Text>
              <Text size="xs" c="dimmed">
                People
              </Text>
            </div>
            <div className={styles.statBadge}>
              <Text size="lg" fw={700} c="orange">
                {data.activeTasks ?? 0}
              </Text>
              <Text size="xs" c="dimmed">
                Active
              </Text>
            </div>
            <div className={styles.statBadge}>
              <Text size="lg" fw={700} c="yellow">
                {data.pendingTasks ?? 0}
              </Text>
              <Text size="xs" c="dimmed">
                Pending
              </Text>
            </div>
            <div className={styles.statBadge}>
              <Text size="lg" fw={700} c="teal">
                {data.completedTasks ?? 0}
              </Text>
              <Text size="xs" c="dimmed">
                Done
              </Text>
            </div>
          </Group>

          {/* Assigned people */}
          {data.assignedPeople && data.assignedPeople.length > 0 && (
            <div className={styles.drawerSection}>
              <Group gap="xs" justify="space-between" mb={8}>
                <Text
                  size="xs"
                  fw={600}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: "0.05em" }}
                >
                  People ({data.assignedPeople.length})
                </Text>
                <ActionIcon
                  size="xs"
                  variant="light"
                  color="teal"
                  onClick={onAddPerson}
                  aria-label="Add person"
                >
                  <UserPlusIcon size={12} />
                </ActionIcon>
              </Group>
              <Stack gap="xs">
                {data.assignedPeople.map((p) => (
                  <Group key={p.id} gap="xs">
                    <Avatar size="sm" color="teal" radius="xl">
                      {p.name[0]}
                    </Avatar>
                    <Stack gap={0}>
                      <Text size="xs" fw={600}>
                        {p.name}
                      </Text>
                      {p.designation && (
                        <Text size="xs" c="dimmed">
                          {p.designation}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                ))}
              </Stack>
            </div>
          )}

          {/* Recent activity */}
          {data.recentActivity && data.recentActivity.length > 0 && (
            <div className={styles.drawerSection}>
              <Text
                size="xs"
                fw={600}
                c="dimmed"
                mb={8}
                tt="uppercase"
                style={{ letterSpacing: "0.05em" }}
              >
                Recent Activity
              </Text>
              <Stack gap="xs">
                {data.recentActivity.slice(0, 4).map((item) => (
                  <Group key={item.id} gap="xs" align="flex-start">
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--mantine-color-blue-5)",
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />
                    <Stack gap={0}>
                      <Text size="xs">{item.action}</Text>
                      <Text size="xs" c="dimmed">
                        {item.timestamp}
                      </Text>
                    </Stack>
                  </Group>
                ))}
              </Stack>
            </div>
          )}

          {/* Dates */}
          {(data.createdAt || data.updatedAt) && (
            <Group gap="md" justify="space-between">
              {data.createdAt && (
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    Created
                  </Text>
                  <Text size="xs" fw={500}>
                    {data.createdAt}
                  </Text>
                </Stack>
              )}
              {data.updatedAt && (
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    Last updated
                  </Text>
                  <Text size="xs" fw={500}>
                    {data.updatedAt}
                  </Text>
                </Stack>
              )}
            </Group>
          )}

          <Divider />

          {/* Quick actions */}
          <Stack gap="xs">
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              Quick Actions
            </Text>
            <Group gap="xs" wrap="wrap">
              <Button
                size="xs"
                variant="light"
                color="violet"
                leftSection={<PencilSimpleIcon size={12} aria-label="Edit" />}
                onClick={() => onEdit(nodeId)}
              >
                Edit
              </Button>
              <Button
                size="xs"
                variant="light"
                color="teal"
                leftSection={<UserPlusIcon size={12} aria-label="Add person" />}
                onClick={onAddPerson}
              >
                Add Person
              </Button>
              <Button
                size="xs"
                variant="light"
                color="blue"
                leftSection={
                  <PlusIcon size={12} aria-label="Add child department" />
                }
                onClick={onAddChild}
              >
                Add Child Dept
              </Button>
              <Button
                size="xs"
                variant="light"
                color="orange"
                leftSection={<ArchiveIcon size={12} aria-label="Archive" />}
              >
                Archive
              </Button>
              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<TrashIcon size={12} aria-label="Delete" />}
                onClick={() => {
                  onDelete(nodeId);
                  onClose();
                }}
              >
                Delete
              </Button>
            </Group>
          </Stack>

          {/* View full details */}
          <Button
            fullWidth
            variant="light"
            color="blue"
            rightSection={
              <ArrowSquareOutIcon size={14} aria-label="Open full details" />
            }
          >
            View Full Details
          </Button>
        </Stack>
      </ScrollArea>
    </Drawer>
  );
}
