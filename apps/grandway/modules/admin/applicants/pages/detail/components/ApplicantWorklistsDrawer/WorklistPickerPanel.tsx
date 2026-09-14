"use client";

import {
  Badge,
  Center,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useChecklistsList } from "@/modules/admin/checklists/checklists.hooks";
import {
  CHECKLIST_STATUS_COLORS,
  CHECKLIST_STATUS_LABELS,
} from "@/modules/admin/checklists/checklists.labels";
import type { Checklist } from "@/modules/admin/checklists/checklists.types";
import {
  applicantWorklistListParams,
  sortWorklists,
} from "./ApplicantWorklistsDrawer.utils";
import classes from "./WorklistPickerPanel.module.css";

/** One worklist: what it is, where it stands, how far along. Nothing else — this is a picker. */
function WorklistRow({
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

/**
 * Level one of the drawer: which worklist. An applicant has one per journey, so
 * this is a short list — it stays a list rather than collapsing to the first
 * match, because "which of their objectives is this about" is the question the
 * operator is actually answering here.
 */
export function WorklistPickerPanel({
  applicantId,
  onSelect,
}: {
  applicantId: string;
  onSelect: (worklistId: string) => void;
}) {
  const { data, isLoading, isError, isRefetching, refetch } = useChecklistsList(
    applicantWorklistListParams(applicantId),
  );

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" aria-label="Loading worklists" />
      </Center>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load this applicant's worklists."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  const worklists = sortWorklists(data?.data ?? []);

  if (worklists.length === 0) {
    return (
      <Text size="sm" c="dimmed" py="lg">
        No worklists yet. Setting a journey&apos;s destination country creates
        one automatically from that country&apos;s requirement template.
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {worklists.map((worklist) => (
        <WorklistRow
          key={worklist.id}
          worklist={worklist}
          onOpen={() => onSelect(worklist.id)}
        />
      ))}
    </Stack>
  );
}
