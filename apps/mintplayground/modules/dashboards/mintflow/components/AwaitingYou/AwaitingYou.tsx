"use client";

import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";

import { MonoText, SectionLabel } from "@/components";
import { tokens } from "@/config/design";
import {
  actorLabel,
  formatGregorian,
  resolveTitle,
  useActorDirectory,
  WORK_STATUS_LABEL,
} from "@/lib/work";
import {
  useMyActiveWork,
  useMyPendingAssignments,
  useMyPendingReviews,
} from "../../Mintflow.hooks";
import type { AwaitingColumnProps } from "./AwaitingYou.types";

const CARD_STYLE = {
  background: tokens.paper,
  border: `1px solid ${tokens.line}`,
  borderRadius: tokens.radius.card,
} as const;

function AwaitingColumn<T>({
  title,
  query,
  emptyLabel,
  renderRow,
}: AwaitingColumnProps<T>) {
  const rows = query.data ?? [];
  return (
    <Box p={16} style={CARD_STYLE}>
      <Group justify="space-between" align="center" mb={12}>
        <SectionLabel>{title}</SectionLabel>
        {!query.isLoading && !query.isError ? (
          <MonoText fz="12px" fw={700} c={tokens.muted}>
            {rows.length}
          </MonoText>
        ) : null}
      </Group>

      {query.isLoading ? (
        <Stack gap={8}>
          <Skeleton height={44} radius="md" />
          <Skeleton height={44} radius="md" />
        </Stack>
      ) : query.isError ? (
        <UnstyledButton onClick={() => query.refetch()}>
          <Text fz="13px" c={tokens.muted2}>
            Couldn&apos;t load — tap to retry.
          </Text>
        </UnstyledButton>
      ) : rows.length === 0 ? (
        <Text fz="13px" c="dimmed">
          {emptyLabel}
        </Text>
      ) : (
        <Stack gap={8}>{rows.map(renderRow)}</Stack>
      )}
    </Box>
  );
}

function Row({
  onClick,
  primary,
  secondary,
  meta,
}: {
  onClick: () => void;
  primary: string;
  secondary: string;
  meta?: string;
}) {
  return (
    <UnstyledButton
      onClick={onClick}
      p={10}
      style={{
        borderRadius: 11,
        border: `1px solid ${tokens.line}`,
        textAlign: "left",
      }}
    >
      <Text fz="13px" fw={600} c={tokens.ink} lineClamp={1}>
        {primary}
      </Text>
      <Group justify="space-between" wrap="nowrap" mt={2}>
        <Text fz="11px" c={tokens.muted} lineClamp={1}>
          {secondary}
        </Text>
        {meta ? (
          <MonoText fz="11px" c={tokens.muted} style={{ flexShrink: 0 }}>
            {meta}
          </MonoText>
        ) : null}
      </Group>
    </UnstyledButton>
  );
}

/**
 * The one question this answers: "what's on me right now?" Three live,
 * self-scoped lists from the work backend's `/my/*` endpoints — the only real
 * data on this dashboard. Each row deep-links to the owning case.
 */
export function AwaitingYou() {
  const router = useRouter();
  const active = useMyActiveWork();
  const assignments = useMyPendingAssignments();
  const reviews = useMyPendingReviews();

  const actorDir = useActorDirectory([
    ...(assignments.data ?? []).map((a) => a.issued_by),
    ...(reviews.data ?? []).map((r) => r.requested_by),
  ]);

  return (
    <Box p="md">
      <Group gap={8} align="center" mb={12}>
        <Text fz="15px" fw={700} c={tokens.ink}>
          Awaiting you
        </Text>
        <Badge size="xs" variant="light" color="green" radius="sm">
          Live
        </Badge>
      </Group>

      <SimpleGrid cols={1} spacing="md">
        <AwaitingColumn
          title="My active work"
          query={active}
          emptyLabel="No active work assigned to you."
          renderRow={(item) => (
            <Row
              key={item.id}
              onClick={() => router.push(`/cases/${item.id}`)}
              primary={resolveTitle(item)}
              secondary={`${item.reference_number} · ${WORK_STATUS_LABEL[item.status]}`}
              meta={formatGregorian(item.due_at)}
            />
          )}
        />

        <AwaitingColumn
          title="Pending assignments"
          query={assignments}
          emptyLabel="Nothing awaiting your response."
          renderRow={(a) => (
            <Row
              key={a.id}
              onClick={() => router.push(`/cases/${a.work}`)}
              primary={`Assigned as ${a.category.replace(/_/g, " ")}`}
              secondary={`From ${actorLabel(a.issued_by, actorDir)}`}
              meta={formatGregorian(a.issued_at)}
            />
          )}
        />

        <AwaitingColumn
          title="Pending reviews"
          query={reviews}
          emptyLabel="No reviews waiting on you."
          renderRow={(r) => (
            <Row
              key={r.id}
              onClick={() => router.push(`/cases/${r.work}`)}
              primary={`Review round ${r.round_number}`}
              secondary={`Requested by ${actorLabel(r.requested_by, actorDir)}`}
              meta={formatGregorian(r.requested_at)}
            />
          )}
        />
      </SimpleGrid>
    </Box>
  );
}
