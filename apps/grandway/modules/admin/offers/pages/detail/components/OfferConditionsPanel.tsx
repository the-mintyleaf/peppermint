"use client";

import { useState } from "react";
import { Badge, Button, Group, Paper, Stack, Text } from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import {
  CONDITION_STATUS_COLORS,
  CONDITION_STATUS_LABELS,
  CONDITION_TYPE_LABELS,
} from "../../../offers.labels";
import type { Condition, OfferDetail } from "../../../offers.types";
import { formatOfferDate } from "../../../offers.utils";
import { AddConditionModal } from "./AddConditionModal";
import { ConditionStatusModal } from "./ConditionStatusModal";
import { EditConditionModal } from "./EditConditionModal";

/**
 * Conditions come nested in the offer detail (no separate fetch). Each row
 * shows its status as words + colour (never colour alone) and a status lever
 * that is visually distinct from the fact badge. Conditions are never deleted —
 * one that no longer applies is moved to `not_applicable` via the status
 * control. Adding a condition is allowed in any offer state.
 */
export function OfferConditionsPanel({ offer }: { offer: OfferDetail }) {
  const [addOpen, setAddOpen] = useState(false);
  const [statusFor, setStatusFor] = useState<Condition | null>(null);
  const [editFor, setEditFor] = useState<Condition | null>(null);

  const conditions = offer.conditions;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500}>
          Conditions
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<PlusIcon size={14} aria-hidden />}
          onClick={() => setAddOpen(true)}
        >
          Add condition
        </Button>
      </Group>

      {conditions.length === 0 ? (
        <Text size="xs" c="dimmed">
          No conditions on this offer.
        </Text>
      ) : (
        <Stack gap="xs">
          {conditions.map((condition) => (
            <Paper key={condition.id} withBorder p="sm" radius="sm">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text size="xs" fw={500}>
                      {CONDITION_TYPE_LABELS[condition.condition_type]}
                    </Text>
                    <Badge
                      size="xs"
                      variant="light"
                      color={CONDITION_STATUS_COLORS[condition.status]}
                    >
                      {CONDITION_STATUS_LABELS[condition.status]}
                    </Badge>
                  </Group>
                  <Text size="xs">{condition.description}</Text>
                  {condition.due_date ? (
                    <Text size="xs" c="dimmed">
                      Due{" "}
                      {formatOfferDate(
                        condition.due_date,
                        condition.due_date_bs,
                      )}
                    </Text>
                  ) : null}
                  {condition.resolution_note ? (
                    <Text size="xs" c="dimmed">
                      Note: {condition.resolution_note}
                    </Text>
                  ) : null}
                </Stack>
                <Group gap="xs" wrap="nowrap">
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={() => setEditFor(condition)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="default"
                    onClick={() => setStatusFor(condition)}
                  >
                    Update status
                  </Button>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      <AddConditionModal
        offerId={offer.id}
        opened={addOpen}
        onClose={() => setAddOpen(false)}
      />
      {statusFor ? (
        <ConditionStatusModal
          offerId={offer.id}
          condition={statusFor}
          opened={statusFor !== null}
          onClose={() => setStatusFor(null)}
        />
      ) : null}
      {editFor ? (
        <EditConditionModal
          offerId={offer.id}
          condition={editFor}
          opened={editFor !== null}
          onClose={() => setEditFor(null)}
        />
      ) : null}
    </Stack>
  );
}
