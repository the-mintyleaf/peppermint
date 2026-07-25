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
import { useSetFieldActive } from "../../institutions.hooks";
import type { Field } from "../../institutions.types";

export function FieldCard({
  field,
  onEdit,
}: {
  field: Field;
  onEdit: () => void;
}) {
  const setActive = useSetFieldActive();

  const handleWithdraw = () =>
    openReasonConfirmModal({
      title: "Withdraw field",
      parentLabel: "Fields",
      hideReason: true,
      tone: "danger",
      alertTitle: "This stops the field showing up for new programs",
      description:
        "Programs already classified under it keep it — nothing is deleted, and you can restore it later.",
      confirmLabel: "Withdraw",
      confirmColor: "red",
      onConfirm: async () => {
        await setActive.mutateAsync({ id: field.id, isActive: false });
      },
    });

  return (
    <Card withBorder padding="sm" radius="md">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={4}>
          <Text fw={600} size="sm">
            {field.name}
          </Text>
          <Group gap={6} wrap="wrap">
            <Badge size="xs" variant="light" color="gray">
              {field.code}
            </Badge>
            <Badge size="xs" color={field.is_active ? "teal" : "gray"}>
              {field.is_active ? "Active" : "Withdrawn"}
            </Badge>
          </Group>
        </Stack>

        <Group gap={4} wrap="nowrap">
          <Tooltip label="Edit">
            <ActionIcon
              variant="subtle"
              size="sm"
              aria-label={`Edit ${field.name}`}
              onClick={onEdit}
              disabled={setActive.isPending}
            >
              <PencilSimpleIcon size={14} aria-hidden />
            </ActionIcon>
          </Tooltip>
          {field.is_active ? (
            <Tooltip label="Withdraw from use">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                aria-label={`Withdraw ${field.name}`}
                onClick={handleWithdraw}
                loading={setActive.isPending}
              >
                <ProhibitIcon size={14} aria-hidden />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Tooltip label="Restore">
              <ActionIcon
                variant="subtle"
                size="sm"
                aria-label={`Restore ${field.name}`}
                onClick={() =>
                  setActive.mutate({ id: field.id, isActive: true })
                }
                loading={setActive.isPending}
              >
                <ArrowCounterClockwiseIcon size={14} aria-hidden />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Card>
  );
}
