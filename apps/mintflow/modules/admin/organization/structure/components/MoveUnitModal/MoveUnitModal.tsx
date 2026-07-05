"use client";

import { useState } from "react";
import { Alert, Button, Modal, Stack, Text } from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";

import { UnitPickerSelect } from "../../../_shared/components/UnitPickerSelect";
import { ReasonTextarea } from "../../../_shared/components/ReasonTextarea";
import { useMoveUnit, useUnitDescendants } from "../../Structure.hooks";
import { useStructureStore } from "../../Structure.store";
import type { MoveUnitModalProps } from "./MoveUnitModal.types";

export function MoveUnitModal({ organizationId }: MoveUnitModalProps) {
  const { moveModal, closeMoveModal } = useStructureStore();
  const { data: descendants } = useUnitDescendants(moveModal.unitId ?? null);
  const moveMutation = useMoveUnit(organizationId);
  const [newParent, setNewParent] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const excludeUnitIds = moveModal.unitId
    ? [moveModal.unitId, ...(descendants ?? []).map((unit) => unit.id)]
    : [];

  function handleClose() {
    setNewParent(null);
    setReason("");
    closeMoveModal();
  }

  function handleSubmit() {
    if (!moveModal.unitId) return;
    moveMutation.mutate(
      { unitId: moveModal.unitId, payload: { new_parent: newParent, reason } },
      { onSuccess: handleClose },
    );
  }

  return (
    <Modal opened={moveModal.open} onClose={handleClose} title="Move Unit">
      <Stack gap="md" p="md">
        <Text size="sm">
          Moving <strong>{moveModal.unitName}</strong>. Choose a new parent, or
          leave empty to promote it to a root-level unit.
        </Text>
        {(descendants?.length ?? 0) > 0 && (
          <Alert color="orange" icon={<WarningIcon size={16} weight="fill" />}>
            This unit has {descendants!.length} descendant unit
            {descendants!.length === 1 ? "" : "s"} that will move with it.
          </Alert>
        )}
        <UnitPickerSelect
          organizationId={organizationId}
          label="New Parent"
          placeholder="Leave empty for root level"
          excludeUnitIds={excludeUnitIds}
          value={newParent}
          onChange={setNewParent}
        />
        <ReasonTextarea
          value={reason}
          onChange={setReason}
          required
          placeholder="e.g. Reorganization: moved under Administration Directorate."
        />
        <Button
          fullWidth
          loading={moveMutation.isPending}
          disabled={!reason.trim()}
          onClick={handleSubmit}
        >
          Move Unit
        </Button>
      </Stack>
    </Modal>
  );
}
