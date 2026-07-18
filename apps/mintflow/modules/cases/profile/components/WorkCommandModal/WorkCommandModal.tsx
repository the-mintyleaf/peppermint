"use client";

import {
  Button,
  DatePickerInput,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";

import {
  CLOSURE_OUTCOME,
  getWorkErrorMessage,
  type ClosureOutcome,
} from "@/lib/work";
import {
  useCloseWork,
  useExtendDeadline,
  useReopenWork,
} from "../../../cases.mutations";
import type {
  CloseValues,
  DeadlineValues,
  ReopenValues,
  WorkCommandModalProps,
} from "./WorkCommandModal.types";

/** A date-only picker value → an ISO datetime the backend's DateTimeField accepts. */
function toIsoDateTime(value: string | null): string {
  if (!value) return "";
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value;
}

function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const CLOSURE_OUTCOME_OPTIONS = CLOSURE_OUTCOME.map((v) => ({
  value: v,
  label: humanize(v),
}));

const MODAL_TITLE: Record<
  NonNullable<WorkCommandModalProps["command"]>,
  string
> = {
  deadline: "Extend deadline",
  close: "Close work",
  reopen: "Reopen work",
};

/* ── Footer shared by every command form ──────────────────────────────────── */

function FormFooter({
  onCancel,
  submitLabel,
  danger,
}: {
  onCancel: () => void;
  submitLabel: string;
  danger?: boolean;
}) {
  const { handleSubmit, isLoading } = useFormControls();
  return (
    <Group justify="flex-end" gap="sm" mt="xs">
      <Button variant="default" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        color={danger ? "red" : undefined}
        loading={isLoading}
        onClick={handleSubmit}
      >
        {submitLabel}
      </Button>
    </Group>
  );
}

/* ── Reopen (reason) ──────────────────────────────────────────────────────── */

const reopenSchema = z.object({
  reason: z.string().trim().min(1, "A reason is required to reopen"),
});

function ReopenFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<ReopenValues>();
  return (
    <Stack gap="md">
      <Textarea
        label="Reason for reopening"
        placeholder="Why is this work being reopened?"
        autosize
        minRows={2}
        required
        {...form.getInputProps("reason")}
      />
      <FormFooter onCancel={onCancel} submitLabel="Reopen" />
    </Stack>
  );
}

/* ── Extend deadline (date + reason) ──────────────────────────────────────── */

const deadlineSchema = z.object({
  new_due_at: z.string().min(1, "Pick a new deadline"),
  reason: z.string().trim().min(1, "A reason is required"),
});

function DeadlineFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<DeadlineValues>();
  return (
    <Stack gap="md">
      <DatePickerInput
        label="New deadline"
        placeholder="Pick a date"
        required
        {...form.getInputProps("new_due_at")}
      />
      <Textarea
        label="Reason"
        placeholder="Why is the deadline changing?"
        autosize
        minRows={2}
        required
        {...form.getInputProps("reason")}
      />
      <FormFooter onCancel={onCancel} submitLabel="Extend deadline" />
    </Stack>
  );
}

/* ── Close (outcome + summary) ────────────────────────────────────────────── */

const closeSchema = z.object({
  outcome: z.string().min(1, "Pick an outcome"),
  closure_summary: z.string().trim().min(1, "A closure summary is required"),
  completed_scope: z.string(),
  unresolved_scope: z.string(),
});

function CloseFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<CloseValues>();
  return (
    <Stack gap="md">
      <Select
        label="Outcome"
        placeholder="How did this work resolve?"
        data={CLOSURE_OUTCOME_OPTIONS}
        required
        {...form.getInputProps("outcome")}
      />
      <Textarea
        label="Closure summary"
        placeholder="Summarize the outcome and what was achieved"
        autosize
        minRows={3}
        required
        {...form.getInputProps("closure_summary")}
      />
      <Textarea
        label="Completed scope"
        description="Optional — what was completed"
        autosize
        minRows={2}
        {...form.getInputProps("completed_scope")}
      />
      <Textarea
        label="Unresolved scope"
        description="Optional — what remains"
        autosize
        minRows={2}
        {...form.getInputProps("unresolved_scope")}
      />
      <FormFooter onCancel={onCancel} submitLabel="Close work" danger />
    </Stack>
  );
}

/**
 * The form modals for the three work commands that need input. One dispatcher so
 * the profile just sets a command; each command remounts a fresh form.
 */
export function WorkCommandModal({
  workId,
  command,
  onClose,
}: WorkCommandModalProps) {
  const reopen = useReopenWork(workId);
  const deadline = useExtendDeadline(workId);
  const close = useCloseWork(workId);

  async function runReopen(values: ReopenValues) {
    try {
      await reopen.mutateAsync({ reason: values.reason.trim() });
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  async function runDeadline(values: DeadlineValues) {
    try {
      await deadline.mutateAsync({
        new_due_at: toIsoDateTime(values.new_due_at),
        reason: values.reason.trim(),
      });
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  async function runClose(values: CloseValues) {
    try {
      await close.mutateAsync({
        outcome: values.outcome as ClosureOutcome,
        closure_summary: values.closure_summary.trim(),
        completed_scope: values.completed_scope.trim() || undefined,
        unresolved_scope: values.unresolved_scope.trim() || undefined,
      });
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  return (
    <Modal
      opened={command !== null}
      onClose={onClose}
      title={command ? MODAL_TITLE[command] : ""}
      centered
      radius="md"
      size={520}
      closeOnClickOutside={false}
    >
      {command === "reopen" ? (
        <FormWrapper<ReopenValues>
          key="reopen"
          initial={{ reason: "" }}
          validation={[reopenSchema]}
          finalSubmitFn={runReopen}
        >
          <ReopenFields onCancel={onClose} />
        </FormWrapper>
      ) : null}

      {command === "deadline" ? (
        <FormWrapper<DeadlineValues>
          key="deadline"
          initial={{ new_due_at: null, reason: "" }}
          validation={[deadlineSchema]}
          finalSubmitFn={runDeadline}
        >
          <DeadlineFields onCancel={onClose} />
        </FormWrapper>
      ) : null}

      {command === "close" ? (
        <FormWrapper<CloseValues>
          key="close"
          initial={{
            outcome: "",
            closure_summary: "",
            completed_scope: "",
            unresolved_scope: "",
          }}
          validation={[closeSchema]}
          finalSubmitFn={runClose}
        >
          <CloseFields onCancel={onClose} />
        </FormWrapper>
      ) : null}
    </Modal>
  );
}
