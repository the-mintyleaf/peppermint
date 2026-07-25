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
} from "../../institutions.constants";
import { useUpdateCountry, useWithdrawCountry } from "../../institutions.hooks";
import type { Country } from "../../institutions.types";

export function CountryCard({
  country,
  onEdit,
}: {
  country: Country;
  onEdit: () => void;
}) {
  const withdraw = useWithdrawCountry();
  const update = useUpdateCountry();
  const withdrawn = country.availability_status === "inactive";
  const busy = withdraw.isPending || update.isPending;

  const handleWithdraw = () =>
    openReasonConfirmModal({
      title: "Withdraw country",
      parentLabel: "Countries",
      tone: "danger",
      alertTitle:
        "This drops every program in this country from the default search",
      description:
        "Nothing is deleted — recorded offers keep their reference and you can restore it later.",
      confirmLabel: "Withdraw",
      confirmColor: "red",
      onConfirm: async (reason) => {
        await withdraw.mutateAsync({ id: country.id, note: reason });
      },
    });

  const handleRestore = () =>
    openReasonConfirmModal({
      title: "Restore country",
      parentLabel: "Countries",
      hideReason: true,
      tone: "info",
      alertTitle: "This makes the country available again",
      description: "Its programs can re-enter the default search.",
      confirmLabel: "Restore",
      confirmColor: "teal",
      onConfirm: async () => {
        await update.mutateAsync({
          id: country.id,
          body: { availability_status: "active", availability_note: "" },
        });
      },
    });

  return (
    <Card withBorder padding="sm" radius="md">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={4}>
          <Text fw={600} size="sm">
            {country.name}
          </Text>
          <Group gap={6} wrap="wrap">
            <Badge size="xs" variant="light" color="gray">
              {country.code}
            </Badge>
            <Badge
              size="xs"
              color={AVAILABILITY_COLORS[country.availability_status]}
            >
              {AVAILABILITY_LABELS[country.availability_status]}
            </Badge>
          </Group>
          {country.availability_note ? (
            <Text size="xs" c="dimmed">
              {country.availability_note}
            </Text>
          ) : null}
        </Stack>

        <Group gap={4} wrap="nowrap">
          <Tooltip label="Edit">
            <ActionIcon
              variant="subtle"
              size="sm"
              aria-label={`Edit ${country.name}`}
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
                aria-label={`Restore ${country.name}`}
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
                aria-label={`Withdraw ${country.name}`}
                onClick={handleWithdraw}
                loading={withdraw.isPending}
                disabled={busy}
              >
                <ProhibitIcon size={14} aria-hidden />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Card>
  );
}
