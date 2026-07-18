"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Group,
  Skeleton,
  Stack,
  Text,
} from "@peppermint/ui";

import {
  actorLabel,
  formatGregorian,
  useActorDirectory,
  type ReviewDecision,
} from "@/lib/work";
import { tokens } from "@/config/design";
import { useReviews } from "../../CaseProfile.hooks";
import { ReviewActionModal } from "./ReviewActionModal";
import type { ReviewAction } from "./ReviewActionModal.types";
import type { ReviewPanelProps } from "./ReviewPanel.types";

const DECISION_COLOR: Record<ReviewDecision, string> = {
  approved: "green",
  approved_with_remarks: "green",
  changes_requested: "yellow",
  rejected: "red",
  returned_without_review: "gray",
};

function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function ReviewPanel({ workId }: ReviewPanelProps) {
  const query = useReviews(workId, true);
  const [modal, setModal] = useState<{
    action: ReviewAction;
    reviewId: string;
  } | null>(null);

  const reviews = query.data ?? [];
  const actorDir = useActorDirectory(reviews.map((r) => r.reviewer));

  return (
    <Stack gap="md">
      <Text fz="13px" fw={600} c={tokens.muted2}>
        Review rounds · {query.isLoading ? "…" : reviews.length}
      </Text>

      {query.isLoading ? (
        <Stack gap={8}>
          <Skeleton height={64} radius="md" />
          <Skeleton height={64} radius="md" />
        </Stack>
      ) : query.isError ? (
        <Group gap="sm">
          <Text fz="sm" c={tokens.muted2}>
            Couldn&apos;t load reviews.
          </Text>
          <Button
            size="compact-xs"
            variant="subtle"
            onClick={() => query.refetch()}
          >
            Retry
          </Button>
        </Group>
      ) : reviews.length === 0 ? (
        <Text fz="sm" c="dimmed" ta="center" py="lg">
          No review rounds yet. Submit the work for review to start one.
        </Text>
      ) : (
        <Stack gap={8}>
          {reviews.map((r) => {
            const undecided = r.decision === null && !r.is_superseded;
            return (
              <Box
                key={r.id}
                p={12}
                style={{ borderRadius: 12, border: `1px solid ${tokens.line}` }}
              >
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Box style={{ minWidth: 0 }}>
                    <Text fz="14px" fw={600} c={tokens.ink}>
                      Round {r.round_number}
                    </Text>
                    <Text fz="12px" c={tokens.muted} mt={2}>
                      Reviewer {actorLabel(r.reviewer, actorDir)} ·{" "}
                      {formatGregorian(r.requested_at)}
                    </Text>
                  </Box>
                  <Badge
                    color={r.decision ? DECISION_COLOR[r.decision] : "blue"}
                    variant="light"
                    radius="sm"
                    size="sm"
                    style={{ flexShrink: 0 }}
                  >
                    {r.decision ? humanize(r.decision) : "Pending"}
                  </Badge>
                </Group>

                {r.decision_remarks ? (
                  <Text fz="13px" c={tokens.muted2} mt={8} lineClamp={2}>
                    {r.decision_remarks}
                  </Text>
                ) : null}

                {!r.is_superseded ? (
                  <Group gap="xs" mt={10}>
                    {undecided ? (
                      <Button
                        size="compact-xs"
                        variant="light"
                        onClick={() =>
                          setModal({ action: "decide", reviewId: r.id })
                        }
                      >
                        Decide
                      </Button>
                    ) : null}
                    <Button
                      size="compact-xs"
                      variant="subtle"
                      color="gray"
                      onClick={() =>
                        setModal({ action: "comment", reviewId: r.id })
                      }
                    >
                      Comment
                    </Button>
                  </Group>
                ) : null}
              </Box>
            );
          })}
        </Stack>
      )}

      <ReviewActionModal
        workId={workId}
        action={modal?.action ?? null}
        reviewId={modal?.reviewId ?? null}
        onClose={() => setModal(null)}
      />
    </Stack>
  );
}
