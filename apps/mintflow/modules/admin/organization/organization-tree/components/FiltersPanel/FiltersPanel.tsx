"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Chip,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
} from "@peppermint/ui";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import type { FilterKey, ExpandStrategy } from "../../OrganizationTree.types";
import { useOrgTreeStore } from "../../OrganizationTree.store";

const FILTER_OPTIONS: Array<{ key: FilterKey; label: string }> = [
  { key: "depts_only", label: "Departments only" },
  { key: "people_only", label: "People only" },
  { key: "leadership_only", label: "Leadership" },
  { key: "health_issues_only", label: "Has health issues" },
  { key: "empty_depts_only", label: "Empty departments" },
  { key: "no_head_only", label: "Missing head" },
  { key: "active_only", label: "Active only" },
  { key: "inactive_only", label: "Inactive only" },
];

const STRATEGY_OPTIONS: Array<{
  key: ExpandStrategy;
  label: string;
  description: string;
}> = [
  {
    key: "direct",
    label: "Direct children",
    description: "Show only immediate next level",
  },
  {
    key: "depts_only",
    label: "Depts only",
    description: "Expand departments, skip people",
  },
  {
    key: "people_only",
    label: "People only",
    description: "Expand people, skip departments",
  },
  {
    key: "leadership",
    label: "Leadership chain",
    description: "Head and manager roles only",
  },
  {
    key: "full_branch",
    label: "Full branch",
    description: "Expand entire subtree (may be large)",
  },
];

export function FiltersPanel() {
  const [open, setOpen] = useState(false);
  const {
    activeFilters,
    expandStrategy,
    expandedNodeIds,
    setFilter,
    clearFilters,
    setExpandStrategy,
    reapplyExpandStrategy,
  } = useOrgTreeStore();

  const activeCount = activeFilters.length;

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 10,
      }}
    >
      <Button
        size="xs"
        variant={activeCount > 0 ? "filled" : "light"}
        color="indigo"
        leftSection={<FunnelIcon size={13} aria-label="Filters" />}
        rightSection={
          activeCount > 0 ? (
            <Badge size="xs" color="white" c="indigo" circle>
              {activeCount}
            </Badge>
          ) : null
        }
        onClick={() => setOpen((v) => !v)}
      >
        Filters
      </Button>

      {open && (
        <Paper
          withBorder
          shadow="md"
          radius="md"
          p="md"
          style={{
            position: "absolute",
            top: 36,
            right: 0,
            width: 260,
            zIndex: 20,
          }}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                Filters
              </Text>
              {activeCount > 0 && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  leftSection={<XIcon size={11} aria-label="Clear" />}
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              )}
            </Group>

            <Stack gap={6}>
              {FILTER_OPTIONS.map(({ key, label }) => (
                <Chip
                  key={key}
                  size="xs"
                  checked={activeFilters.includes(key)}
                  onChange={(checked) => setFilter(key, checked)}
                >
                  {label}
                </Chip>
              ))}
            </Stack>

            <Divider />

            <Stack gap={6}>
              <Group justify="space-between" align="center">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                  Expand Strategy
                </Text>
                {expandedNodeIds.length > 0 && (
                  <Button
                    size="compact-xs"
                    variant="light"
                    color="indigo"
                    leftSection={
                      <ArrowsClockwiseIcon size={11} aria-label="Re-apply" />
                    }
                    onClick={reapplyExpandStrategy}
                  >
                    Re-apply
                  </Button>
                )}
              </Group>
              {STRATEGY_OPTIONS.map(({ key, label, description }) => (
                <div
                  key={key}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background:
                      expandStrategy === key
                        ? "var(--mantine-color-indigo-0)"
                        : "transparent",
                    border:
                      expandStrategy === key
                        ? "1px solid var(--mantine-color-indigo-3)"
                        : "1px solid transparent",
                  }}
                  onClick={() => setExpandStrategy(key)}
                >
                  <Text
                    size="xs"
                    fw={expandStrategy === key ? 600 : 400}
                    c={expandStrategy === key ? "indigo" : "dark"}
                  >
                    {label}
                  </Text>
                  <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
                    {description}
                  </Text>
                </div>
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}
    </div>
  );
}
