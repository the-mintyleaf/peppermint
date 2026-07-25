"use client";

import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@peppermint/ui";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { openReasonConfirmModal } from "@peppermint/admin";
import {
  AVAILABILITY_COLORS,
  AVAILABILITY_LABELS,
} from "../../../../../institutions.constants";
import {
  useUpdateCampus,
  useWithdrawCampus,
} from "../../../../../institutions.hooks";
import type { Campus } from "../../../../../institutions.types";

export function CampusCard({
  campus,
  institutionId,
  canManage,
  onEdit,
}: {
  campus: Campus;
  institutionId: string;
  canManage: boolean;
  onEdit: () => void;
}) {
  const withdraw = useWithdrawCampus(institutionId);
  const update = useUpdateCampus(institutionId);
  const withdrawn = campus.availability_status === "inactive";
  const busy = withdraw.isPending || update.isPending;

  const handleWithdraw = () =>
    openReasonConfirmModal({
      title: "Withdraw campus",
      parentLabel: "Campuses",
      tone: "danger",
      alertTitle: "This drops the campus from the default search",
      description: "Nothing is deleted — you can restore it later.",
      confirmLabel: "Withdraw",
      confirmColor: "red",
      onConfirm: async (reason) => {
        await withdraw.mutateAsync({ id: campus.id, note: reason });
      },
    });

  const handleRestore = () =>
    openReasonConfirmModal({
      title: "Restore campus",
      parentLabel: "Campuses",
      hideReason: true,
      tone: "info",
      alertTitle: "This makes the campus available again",
      description: "It can re-enter the default search.",
      confirmLabel: "Restore",
      confirmColor: "teal",
      onConfirm: async () => {
        await update.mutateAsync({
          id: campus.id,
          body: { availability_status: "active", availability_note: "" },
        });
      },
    });

  return (
    <Card withBorder padding="sm" radius="md">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={4}>
          <Text fw={600} size="sm">
            {campus.name}
          </Text>
          <Group gap={6} wrap="wrap">
            {campus.city ? (
              <Text size="xs" c="dimmed">
                {campus.city}
              </Text>
            ) : null}
            <Badge
              size="xs"
              color={AVAILABILITY_COLORS[campus.availability_status]}
            >
              {AVAILABILITY_LABELS[campus.availability_status]}
            </Badge>
          </Group>
          {campus.availability_note ? (
            <Text size="xs" c="dimmed">
              {campus.availability_note}
            </Text>
          ) : null}
        </Stack>

        {canManage ? (
          <Group gap={4} wrap="nowrap">
            <Tooltip label="Edit">
              <ActionIcon
                variant="subtle"
                size="sm"
                aria-label={`Edit ${campus.name}`}
                onClick={onEdit}
                disabled={busy}
              >
                <PencilSimpleIcon size={14} aria-hidden />
              </ActionIcon>
            </Tooltip>
            {withdrawn ? (
              <Tooltip label="Restore">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  aria-label={`Restore ${campus.name}`}
                  onClick={handleRestore}
                  loading={update.isPending}
                  disabled={busy}
                >
                  <ArrowCounterClockwiseIcon size={14} aria-hidden />
                </ActionIcon>
              </Tooltip>
            ) : (
              <Tooltip label="Withdraw from use">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  aria-label={`Withdraw ${campus.name}`}
                  onClick={handleWithdraw}
                  loading={withdraw.isPending}
                  disabled={busy}
                >
                  <ProhibitIcon size={14} aria-hidden />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        ) : null}
      </Group>
    </Card>
  );
}
