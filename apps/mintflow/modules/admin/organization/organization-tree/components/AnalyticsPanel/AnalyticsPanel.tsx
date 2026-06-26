"use client";

import { useState } from "react";
import {
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { UserMinusIcon } from "@phosphor-icons/react/dist/csr/UserMinus";
import { FolderMinusIcon } from "@phosphor-icons/react/dist/csr/FolderMinus";

interface AnalyticsPanelProps {
  totalOrgs: number;
  totalDepts: number;
  totalPeople: number;
  missingHeads: number;
  emptyDepts: number;
  inactivePeople: number;
}

function StatChip({
  icon,
  value,
  color,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  color?: string;
  label: string;
}) {
  return (
    <Group gap={3} wrap="nowrap" title={label}>
      {icon}
      <Text size="xs" fw={600} c={color ?? "dark"} style={{ lineHeight: 1 }}>
        {value.toLocaleString()}
      </Text>
    </Group>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Group justify="space-between" gap={8}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" fw={600} c={color ?? "dark"}>
        {value.toLocaleString()}
      </Text>
    </Group>
  );
}

export function AnalyticsPanel({
  totalOrgs,
  totalDepts,
  totalPeople,
  missingHeads,
  emptyDepts,
  inactivePeople,
}: AnalyticsPanelProps) {
  const [open, setOpen] = useState(false);
  const totalIssues = missingHeads + emptyDepts;
  const hasIssues = totalIssues > 0;

  return (
    <div style={{ position: "absolute", bottom: 16, left: 12, zIndex: 10 }}>
      {open && (
        <Paper
          withBorder
          shadow="md"
          radius="md"
          p="sm"
          style={{
            position: "absolute",
            bottom: 44,
            left: 0,
            width: 200,
            zIndex: 20,
          }}
        >
          <Stack gap="sm">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              Structure
            </Text>
            <Stack gap={4}>
              <StatRow label="Organizations" value={totalOrgs} />
              <StatRow label="Departments" value={totalDepts} />
              <StatRow label="People" value={totalPeople} />
            </Stack>

            {hasIssues && (
              <>
                <Divider />
                <Group gap={4}>
                  <WarningIcon
                    size={12}
                    color="var(--mantine-color-orange-6)"
                    aria-label="Issues"
                  />
                  <Text size="xs" fw={600} tt="uppercase" c="orange">
                    Issues
                  </Text>
                </Group>
                <Stack gap={4}>
                  {missingHeads > 0 && (
                    <StatRow
                      label="Missing heads"
                      value={missingHeads}
                      color="orange"
                    />
                  )}
                  {emptyDepts > 0 && (
                    <StatRow
                      label="Empty depts"
                      value={emptyDepts}
                      color="orange"
                    />
                  )}
                  {inactivePeople > 0 && (
                    <StatRow
                      label="Inactive people"
                      value={inactivePeople}
                      color="gray"
                    />
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </Paper>
      )}

      {/* Trigger button — sits on the same row as the toolbar */}
      <UnstyledButton
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 36,
          padding: "0 12px",
          background: "var(--mantine-color-default)",
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: 14,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          cursor: "pointer",
        }}
        aria-label="Toggle overview"
      >
        <StatChip
          icon={
            <BuildingsIcon
              size={13}
              color="var(--mantine-color-blue-5)"
              aria-label="Organizations"
            />
          }
          value={totalOrgs}
          color="blue"
          label="Organizations"
        />
        <div
          style={{
            width: 1,
            height: 14,
            background: "var(--mantine-color-default-border)",
          }}
        />
        <StatChip
          icon={
            <FolderIcon
              size={13}
              color="var(--mantine-color-violet-5)"
              aria-label="Departments"
            />
          }
          value={totalDepts}
          color="violet"
          label="Departments"
        />
        <div
          style={{
            width: 1,
            height: 14,
            background: "var(--mantine-color-default-border)",
          }}
        />
        <StatChip
          icon={
            <UsersIcon
              size={13}
              color="var(--mantine-color-teal-5)"
              aria-label="People"
            />
          }
          value={totalPeople}
          color="teal"
          label="People"
        />
        {hasIssues && (
          <>
            <div
              style={{
                width: 1,
                height: 14,
                background: "var(--mantine-color-default-border)",
              }}
            />
            <StatChip
              icon={
                <WarningIcon
                  size={13}
                  color="var(--mantine-color-orange-5)"
                  aria-label="Issues"
                />
              }
              value={totalIssues}
              color="orange"
              label="Health issues"
            />
          </>
        )}
        {inactivePeople > 0 && (
          <>
            <div
              style={{
                width: 1,
                height: 14,
                background: "var(--mantine-color-default-border)",
              }}
            />
            <StatChip
              icon={
                <UserMinusIcon
                  size={13}
                  color="var(--mantine-color-gray-5)"
                  aria-label="Inactive"
                />
              }
              value={inactivePeople}
              color="dimmed"
              label="Inactive people"
            />
          </>
        )}
      </UnstyledButton>
    </div>
  );
}
