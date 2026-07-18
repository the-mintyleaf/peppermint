"use client";

import { Button, Group, Modal, Select, Stack, Textarea } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";

import {
  BLOCKER_TYPE,
  getWorkErrorMessage,
  type BlockerType,
} from "@/lib/work";
import {
  useBlockTask,
  useReturnTask,
  useUnblockTask,
} from "../../../cases.mutations";
import type {
  BlockValues,
  ReturnValues,
  TaskCommandModalProps,
  UnblockValues,
} from "./TaskCommandModal.types";

function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const BLOCKER_TYPE_OPTIONS = BLOCKER_TYPE.map((v) => ({
  value: v,
  label: humanize(v),
}));

const MODAL_TITLE: Record<
  NonNullable<TaskCommandModalProps["command"]>,
  string
> = {
  return: "Return task uncompleted",
  block: "Block task",
  unblock: "Unblock task",
};

function FormFooter({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  const { handleSubmit, isLoading } = useFormControls();
  return (
    <Group justify="flex-end" gap="sm" mt="xs">
      <Button variant="default" onClick={onCancel}>
        Cancel
      </Button>
      <Button loading={isLoading} onClick={handleSubmit}>
        {submitLabel}
      </Button>
    </Group>
  );
}

const returnSchema = z.object({
  reason: z.string().trim().min(1, "A reason is required"),
  report: z.string().trim().min(1, "A report of what was done is required"),
});

function ReturnFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<ReturnValues>();
  return (
    <Stack gap="md">
      <Textarea
        label="Reason"
        placeholder="Why is this task being returned uncompleted?"
        autosize
        minRows={2}
        required
        {...form.getInputProps("reason")}
      />
      <Textarea
        label="Report"
        placeholder="What was done so far"
        autosize
        minRows={2}
        required
        {...form.getInputProps("report")}
      />
      <FormFooter onCancel={onCancel} submitLabel="Return task" />
    </Stack>
  );
}

const blockSchema = z.object({
  blocker_type: z.string().min(1, "Pick a blocker type"),
  description: z.string().trim().min(1, "Describe what's blocking this"),
});

function BlockFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<BlockValues>();
  return (
    <Stack gap="md">
      <Select
        label="Blocker type"
        placeholder="What kind of blocker?"
        data={BLOCKER_TYPE_OPTIONS}
        required
        {...form.getInputProps("blocker_type")}
      />
      <Textarea
        label="Description"
        placeholder="What's blocking this task?"
        autosize
        minRows={2}
        required
        {...form.getInputProps("description")}
      />
      <FormFooter onCancel={onCancel} submitLabel="Block task" />
    </Stack>
  );
}

const unblockSchema = z.object({
  resolution_note: z.string().trim().min(1, "A resolution note is required"),
});

function UnblockFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<UnblockValues>();
  return (
    <Stack gap="md">
      <Textarea
        label="Resolution note"
        placeholder="How was the blocker resolved?"
        autosize
        minRows={2}
        required
        {...form.getInputProps("resolution_note")}
      />
      <FormFooter onCancel={onCancel} submitLabel="Unblock task" />
    </Stack>
  );
}

/** Form modals for the three task commands that need input. */
export function TaskCommandModal({
  workId,
  command,
  task,
  onClose,
}: TaskCommandModalProps) {
  const returnTask = useReturnTask(workId);
  const block = useBlockTask(workId);
  const unblock = useUnblockTask(workId);
  const taskId = task?.id ?? "";

  async function runReturn(values: ReturnValues) {
    try {
      await returnTask.mutateAsync({
        taskId,
        payload: {
          reason: values.reason.trim(),
          report: values.report.trim(),
        },
      });
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  async function runBlock(values: BlockValues) {
    try {
      await block.mutateAsync({
        taskId,
        payload: {
          blocker_type: values.blocker_type as BlockerType,
          description: values.description.trim(),
        },
      });
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  async function runUnblock(values: UnblockValues) {
    try {
      await unblock.mutateAsync({
        taskId,
        payload: { resolution_note: values.resolution_note.trim() },
      });
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  return (
    <Modal
      opened={command !== null && task !== null}
      onClose={onClose}
      title={command ? MODAL_TITLE[command] : ""}
      centered
      radius="md"
      size={480}
      closeOnClickOutside={false}
    >
      {command === "return" ? (
        <FormWrapper<ReturnValues>
          key={`return-${taskId}`}
          initial={{ reason: "", report: "" }}
          validation={[returnSchema]}
          finalSubmitFn={runReturn}
        >
          <ReturnFields onCancel={onClose} />
        </FormWrapper>
      ) : null}

      {command === "block" ? (
        <FormWrapper<BlockValues>
          key={`block-${taskId}`}
          initial={{ blocker_type: "", description: "" }}
          validation={[blockSchema]}
          finalSubmitFn={runBlock}
        >
          <BlockFields onCancel={onClose} />
        </FormWrapper>
      ) : null}

      {command === "unblock" ? (
        <FormWrapper<UnblockValues>
          key={`unblock-${taskId}`}
          initial={{ resolution_note: "" }}
          validation={[unblockSchema]}
          finalSubmitFn={runUnblock}
        >
          <UnblockFields onCancel={onClose} />
        </FormWrapper>
      ) : null}
    </Modal>
  );
}
