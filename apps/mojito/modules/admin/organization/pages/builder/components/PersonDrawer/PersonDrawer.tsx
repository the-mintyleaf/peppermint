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
  ThemeIcon,
  ScrollArea,
} from "@peppermint/ui";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";
import type { PersonDrawerProps } from "./PersonDrawer.types";
import styles from "../../OrganizationBuilder.module.css";

const ROLE_COLORS: Record<string, string> = {
  head: "violet",
  manager: "blue",
  coordinator: "teal",
  officer: "cyan",
  member: "gray",
  advisor: "orange",
};

const STATUS_COLORS: Record<string, string> = {
  active: "teal",
  inactive: "gray",
  archived: "red",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function PersonDrawer({
  opened,
  onClose,
  nodeId,
  data,
  onEdit,
  onDelete,
}: PersonDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={
        <Group gap="sm">
          <Avatar
            src={data.avatarUrl}
            color="teal"
            radius="xl"
            size="md"
            alt={data.fullName}
          >
            {getInitials(data.fullName)}
          </Avatar>
          <Stack gap={0}>
            <Text fw={700} size="sm">
              {data.fullName}
            </Text>
            <Text size="xs" c="dimmed">
              {data.designation}
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
          {/* Status & role */}
          <Group gap="sm">
            <Badge color={STATUS_COLORS[data.status]} variant="light" size="sm">
              {data.status}
            </Badge>
            {data.role && (
              <Badge
                color={ROLE_COLORS[data.role] ?? "gray"}
                variant="light"
                size="sm"
              >
                {data.role}
              </Badge>
            )}
          </Group>

          {/* Info */}
          <div className={styles.drawerSection}>
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              mb={8}
              tt="uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              Profile
            </Text>
            <Stack gap="xs">
              {data.department && (
                <Group gap="xs" justify="space-between">
                  <Text size="xs" c="dimmed">
                    Department
                  </Text>
                  <Text size="xs" fw={600}>
                    {data.department}
                  </Text>
                </Group>
              )}
              {data.reportingManager && (
                <Group gap="xs" justify="space-between">
                  <Text size="xs" c="dimmed">
                    Reports to
                  </Text>
                  <Text size="xs" fw={600}>
                    {data.reportingManager}
                  </Text>
                </Group>
              )}
            </Stack>
          </div>

          {/* Contact */}
          {(data.email || data.phone) && (
            <div className={styles.drawerSection}>
              <Text
                size="xs"
                fw={600}
                c="dimmed"
                mb={8}
                tt="uppercase"
                style={{ letterSpacing: "0.05em" }}
              >
                Contact
              </Text>
              <Stack gap="xs">
                {data.email && (
                  <Group gap="xs">
                    <EnvelopeIcon size={14} aria-label="Email" />
                    <Text size="xs">{data.email}</Text>
                  </Group>
                )}
                {data.phone && (
                  <Group gap="xs">
                    <PhoneIcon size={14} aria-label="Phone" />
                    <Text size="xs">{data.phone}</Text>
                  </Group>
                )}
              </Stack>
            </div>
          )}

          {/* Responsibilities */}
          {data.responsibilities && data.responsibilities.length > 0 && (
            <div className={styles.drawerSection}>
              <Text
                size="xs"
                fw={600}
                c="dimmed"
                mb={8}
                tt="uppercase"
                style={{ letterSpacing: "0.05em" }}
              >
                Responsibilities
              </Text>
              <Stack gap={4}>
                {data.responsibilities.map((r, i) => (
                  <Group key={i} gap="xs" align="flex-start">
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "var(--mantine-color-teal-5)",
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <Text size="xs">{r}</Text>
                  </Group>
                ))}
              </Stack>
            </div>
          )}

          {/* Tasks */}
          {data.activeTasks !== undefined && (
            <div className={styles.statBadge} style={{ textAlign: "center" }}>
              <Text size="xl" fw={700} c="teal">
                {data.activeTasks}
              </Text>
              <Text size="xs" c="dimmed">
                Active Tasks
              </Text>
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
                        background: "var(--mantine-color-teal-5)",
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

          <Divider />

          {/* Actions */}
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="teal"
              leftSection={<PencilSimpleIcon size={12} aria-label="Edit" />}
              onClick={() => onEdit(nodeId)}
            >
              Edit
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<TrashIcon size={12} aria-label="Remove" />}
              onClick={() => {
                onDelete(nodeId);
                onClose();
              }}
            >
              Remove
            </Button>
          </Group>

          <Button
            fullWidth
            variant="light"
            color="teal"
            rightSection={
              <ArrowSquareOutIcon size={14} aria-label="View profile" />
            }
          >
            View Full Profile
          </Button>
        </Stack>
      </ScrollArea>
    </Drawer>
  );
}
