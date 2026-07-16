"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  Select,
  Stack,
  Switch,
  TextInput,
} from "@peppermint/ui";

import { ReasonTextarea } from "../../../_shared/components/ReasonTextarea";
import { useStructureStore } from "../../Structure.store";
import {
  useAddUnitMember,
  useOrgMembershipOptions,
} from "./AddMemberModal.hooks";
import type { AddMemberModalProps } from "./AddMemberModal.types";

export function AddMemberModal({ organizationId }: AddMemberModalProps) {
  const { addMemberModal, closeAddMemberModal } = useStructureStore();
  const { open, unitId, unitName } = addMemberModal;

  const [membershipId, setMembershipId] = useState<string | null>(null);
  const [membershipType, setMembershipType] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [reason, setReason] = useState("");

  const { data, isLoading } = useOrgMembershipOptions(organizationId, open);
  const addMember = useAddUnitMember(organizationId);

  const options = (data?.data ?? []).map((membership) => ({
    value: membership.id,
    label: membership.employee_code || membership.user,
  }));

  // Reset on close (and after a successful add) so the next open starts clean —
  // avoids a form-reset effect that would fire on every render.
  const handleClose = () => {
    setMembershipId(null);
    setMembershipType("");
    setIsPrimary(false);
    setReason("");
    closeAddMemberModal();
  };

  const handleSubmit = () => {
    if (!unitId || !membershipId) return;
    addMember.mutate(
      { membershipId, unitId, membershipType, isPrimary, reason },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      title={unitName ? `Add member to ${unitName}` : "Add member"}
    >
      <Stack gap="md" p="md">
        <Select
          label="Member"
          placeholder={isLoading ? "Loading members…" : "Select a member"}
          data={options}
          value={membershipId}
          onChange={setMembershipId}
          searchable
          nothingFoundMessage="No members found"
          disabled={isLoading || addMember.isPending}
          required
        />
        <TextInput
          label="Membership type"
          placeholder="e.g. staff"
          value={membershipType}
          onChange={(event) => setMembershipType(event.currentTarget.value)}
          disabled={addMember.isPending}
        />
        <Switch
          label="Primary unit for this member"
          checked={isPrimary}
          onChange={(event) => setIsPrimary(event.currentTarget.checked)}
          disabled={addMember.isPending}
        />
        <ReasonTextarea
          value={reason}
          onChange={setReason}
          placeholder="Optional — why this member is being placed here."
        />
        <Button
          fullWidth
          loading={addMember.isPending}
          disabled={!membershipId}
          onClick={handleSubmit}
        >
          Add member
        </Button>
      </Stack>
    </Modal>
  );
}
