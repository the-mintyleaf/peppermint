"use client";

import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";

import {
  getWorkErrorMessage,
  NON_GATED_EVIDENCE_TYPES,
  type EvidenceType,
} from "@/lib/work";
import { useSubmitEvidence } from "../../../cases.mutations";
import type {
  EvidenceFormValues,
  EvidenceModalProps,
} from "./EvidenceModal.types";

function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const EVIDENCE_TYPE_OPTIONS = NON_GATED_EVIDENCE_TYPES.map((v) => ({
  value: v,
  label: humanize(v),
}));

const schema = z.object({
  evidence_type: z.string().min(1, "Pick an evidence type"),
  title: z.string().trim().min(1, "A title is required"),
  text_payload: z.string(),
  external_reference: z.string(),
  purpose: z.string(),
});

function EvidenceFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<EvidenceFormValues>();
  const { handleSubmit, isLoading } = useFormControls();
  const isExternal = form.values.evidence_type === "external_reference";

  return (
    <Stack gap="md">
      <Select
        label="Evidence type"
        placeholder="What kind of evidence?"
        data={EVIDENCE_TYPE_OPTIONS}
        required
        {...form.getInputProps("evidence_type")}
      />
      <TextInput
        label="Title"
        placeholder="Short label for this evidence"
        required
        {...form.getInputProps("title")}
      />
      {isExternal ? (
        <TextInput
          label="External reference"
          placeholder="A URL or reference id"
          {...form.getInputProps("external_reference")}
        />
      ) : (
        <Textarea
          label="Content"
          placeholder="The evidence text"
          autosize
          minRows={3}
          {...form.getInputProps("text_payload")}
        />
      )}
      <Textarea
        label="Purpose"
        description="Optional — why this supports the work"
        autosize
        minRows={2}
        {...form.getInputProps("purpose")}
      />
      <Group justify="flex-end" gap="sm" mt="xs">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button loading={isLoading} onClick={handleSubmit}>
          Submit evidence
        </Button>
      </Group>
    </Stack>
  );
}

export function EvidenceModal({ workId, opened, onClose }: EvidenceModalProps) {
  const submit = useSubmitEvidence(workId);

  async function onSubmit(values: EvidenceFormValues) {
    const isExternal = values.evidence_type === "external_reference";
    try {
      await submit.mutateAsync({
        evidence_type: values.evidence_type as EvidenceType,
        title: values.title.trim(),
        text_payload: isExternal
          ? undefined
          : values.text_payload.trim() || undefined,
        external_reference: isExternal
          ? values.external_reference.trim() || undefined
          : undefined,
        purpose: values.purpose.trim() || undefined,
      });
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Submit evidence"
      centered
      radius="md"
      size={520}
      closeOnClickOutside={false}
    >
      <FormWrapper<EvidenceFormValues>
        key={opened ? "open" : "closed"}
        initial={{
          evidence_type: "",
          title: "",
          text_payload: "",
          external_reference: "",
          purpose: "",
        }}
        validation={[schema]}
        finalSubmitFn={onSubmit}
      >
        <EvidenceFields onCancel={onClose} />
      </FormWrapper>
    </Modal>
  );
}
