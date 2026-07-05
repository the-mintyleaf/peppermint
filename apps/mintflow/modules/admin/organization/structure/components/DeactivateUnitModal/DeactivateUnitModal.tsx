"use client";

import { useState } from "react";
import { Alert, Button, List, Modal, Stack, Text } from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";

import { getApiError } from "@/lib/authErrorMessages";

import { ReasonTextarea } from "../../../_shared/components/ReasonTextarea";
import { useDeactivateUnit, useUnitDescendants } from "../../Structure.hooks";
import { useStructureStore } from "../../Structure.store";
import type { DeactivateUnitModalProps } from "./DeactivateUnitModal.types";

export function DeactivateUnitModal({
  organizationId,
}: DeactivateUnitModalProps) {
  const { deactivateModal, closeDeactivateModal } = useStructureStore();
  const { data: descendants } = useUnitDescendants(
    deactivateModal.unitId ?? null,
  );
  const deactivateMutation = useDeactivateUnit(organizationId);
  const [reason, setReason] = useState("");
  const [blocked, setBlocked] = useState(false);

  const activeChildren = (descendants ?? []).filter(
    (unit) => unit.is_active && unit.status !== "archived",
  );

  function handleClose() {
    setReason("");
    setBlocked(false);
    closeDeactivateModal();
  }

  function handleSubmit() {
    if (!deactivateModal.unitId) return;
    deactivateMutation.mutate(
      { unitId: deactivateModal.unitId, payload: { reason } },
      {
        onSuccess: handleClose,
        onError: (error) => {
          const apiError = getApiError(error);
          if (apiError.code === "ORGANIZATION_UNIT_HAS_ACTIVE_CHILDREN") {
            setBlocked(true);
          }
        },
      },
    );
  }

  return (
    <Modal
      opened={deactivateModal.open}
      onClose={handleClose}
      title="Deactivate Unit"
    >
      <Stack gap="md" p="md">
        <Text size="sm">
          Deactivating <strong>{deactivateModal.unitName}</strong> marks it as
          no longer operational. This does not cascade to child units.
        </Text>
        {blocked && (
          <Alert
            color="orange"
            icon={<WarningIcon size={16} weight="fill" />}
            title="Active children exist"
          >
            <Text size="sm" mb="xs">
              Deactivate or move these units first:
            </Text>
            <List size="sm">
              {activeChildren.map((unit) => (
                <List.Item key={unit.id}>
                  {unit.name} ({unit.code})
                </List.Item>
              ))}
            </List>
          </Alert>
        )}
        <ReasonTextarea
          value={reason}
          onChange={setReason}
          required
          placeholder="e.g. Unit merged into Public Health Division."
        />
        <Button
          fullWidth
          color="red"
          loading={deactivateMutation.isPending}
          disabled={!reason.trim()}
          onClick={handleSubmit}
        >
          Deactivate Unit
        </Button>
      </Stack>
    </Modal>
  );
}
