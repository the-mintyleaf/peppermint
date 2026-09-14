"use client";

import {
  Badge,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import {
  CHECKLIST_STATUS_COLORS,
  CHECKLIST_STATUS_LABELS,
} from "../../checklists.labels";
import type { Checklist } from "../../checklists.types";
import classes from "./WorklistRow.module.css";

/** One worklist: what it is, where it stands, how far along. Nothing else — this is a picker. */
export function WorklistRow({
  worklist,
  onOpen,
}: {
  worklist: Checklist;
  onOpen: () => void;
}) {
  const { progress } = worklist;
  const pct =
    progress.total > 0
      ? Math.round((progress.resolved / progress.total) * 100)
      : 0;

  return (
    <UnstyledButton
      onClick={onOpen}
      className={classes.trigger}
      aria-label={`Open ${worklist.title}`}
    >
      <Paper withBorder radius="md" p="sm" className={classes.row}>
        <Group wrap="nowrap" gap="sm" align="center">
          <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" fw={600} style={{ minWidth: 0 }}>
                {worklist.title}
              </Text>
              <Badge
                size="xs"
                variant="light"
                color={CHECKLIST_STATUS_COLORS[worklist.status]}
              >
                {CHECKLIST_STATUS_LABELS[worklist.status]}
              </Badge>
            </Group>

            <Progress
              value={pct}
              size="xs"
              color={pct === 100 ? "green" : "blue"}
            />

            <Text size="xs" c="dimmed">
              {progress.resolved} of {progress.total} done ·{" "}
              {progress.required_resolved}/{progress.required_total} required
              {worklist.country ? ` · ${worklist.country.name}` : ""}
            </Text>
          </Stack>

          <CaretRightIcon size={14} aria-hidden />
        </Group>
      </Paper>
    </UnstyledButton>
  );
}
