"use client";

import { Button, Group, Modal, Select, Stack, Textarea } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";

import {
  getWorkErrorMessage,
  REVIEW_COMMENT_TYPE,
  REVIEW_DECISION,
  type ReviewCommentType,
  type ReviewDecision,
} from "@/lib/work";
import { useAddReviewComment, useDecideReview } from "../../../cases.mutations";
import type {
  CommentValues,
  DecideValues,
  ReviewActionModalProps,
} from "./ReviewActionModal.types";

function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const DECISION_OPTIONS = REVIEW_DECISION.map((v) => ({
  value: v,
  label: humanize(v),
}));
const COMMENT_TYPE_OPTIONS = REVIEW_COMMENT_TYPE.map((v) => ({
  value: v,
  label: humanize(v),
}));

const decideSchema = z.object({
  decision: z.string().min(1, "Pick a decision"),
  decision_remarks: z.string(),
});
const commentSchema = z.object({
  comment_type: z.string().min(1, "Pick a comment type"),
  body: z.string().trim().min(1, "A comment is required"),
});

function DecideFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<DecideValues>();
  const { handleSubmit, isLoading } = useFormControls();
  return (
    <Stack gap="md">
      <Select
        label="Decision"
        placeholder="How does this review resolve?"
        data={DECISION_OPTIONS}
        required
        {...form.getInputProps("decision")}
      />
      <Textarea
        label="Remarks"
        description="Optional"
        placeholder="Notes on the decision"
        autosize
        minRows={2}
        {...form.getInputProps("decision_remarks")}
      />
      <Group justify="flex-end" gap="sm" mt="xs">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button loading={isLoading} onClick={handleSubmit}>
          Submit decision
        </Button>
      </Group>
    </Stack>
  );
}

function CommentFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<CommentValues>();
  const { handleSubmit, isLoading } = useFormControls();
  return (
    <Stack gap="md">
      <Select
        label="Comment type"
        data={COMMENT_TYPE_OPTIONS}
        required
        {...form.getInputProps("comment_type")}
      />
      <Textarea
        label="Comment"
        placeholder="Your review comment"
        autosize
        minRows={3}
        required
        {...form.getInputProps("body")}
      />
      <Group justify="flex-end" gap="sm" mt="xs">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button loading={isLoading} onClick={handleSubmit}>
          Add comment
        </Button>
      </Group>
    </Stack>
  );
}

export function ReviewActionModal({
  workId,
  action,
  reviewId,
  onClose,
}: ReviewActionModalProps) {
  const decide = useDecideReview(workId);
  const comment = useAddReviewComment(workId);
  const id = reviewId ?? "";

  async function runDecide(values: DecideValues) {
    try {
      await decide.mutateAsync({
        reviewId: id,
        payload: {
          decision: values.decision as ReviewDecision,
          decision_remarks: values.decision_remarks.trim() || undefined,
        },
      });
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  async function runComment(values: CommentValues) {
    try {
      await comment.mutateAsync({
        reviewId: id,
        payload: {
          comment_type: values.comment_type as ReviewCommentType,
          body: values.body.trim(),
        },
      });
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  return (
    <Modal
      opened={action !== null && reviewId !== null}
      onClose={onClose}
      title={action === "decide" ? "Decide review" : "Add review comment"}
      centered
      radius="md"
      size={480}
      closeOnClickOutside={false}
    >
      {action === "decide" ? (
        <FormWrapper<DecideValues>
          key={`decide-${id}`}
          initial={{ decision: "", decision_remarks: "" }}
          validation={[decideSchema]}
          finalSubmitFn={runDecide}
        >
          <DecideFields onCancel={onClose} />
        </FormWrapper>
      ) : null}

      {action === "comment" ? (
        <FormWrapper<CommentValues>
          key={`comment-${id}`}
          initial={{ comment_type: "", body: "" }}
          validation={[commentSchema]}
          finalSubmitFn={runComment}
        >
          <CommentFields onCancel={onClose} />
        </FormWrapper>
      ) : null}
    </Modal>
  );
}
