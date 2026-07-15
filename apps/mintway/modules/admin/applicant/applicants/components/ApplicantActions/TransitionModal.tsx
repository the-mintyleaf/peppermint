"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@peppermint/ui";

import {
  applicantKeys,
  ENGAGEMENT_REASON_REQUIRED,
  ENGAGEMENT_STATUS_LABELS,
  LIFECYCLE_STAGE_LABELS,
  transitionApplicant,
  useApplicantMutation,
} from "../../../_shared";
import type {
  Applicant,
  EngagementStatus,
  LifecycleStage,
  TransitionPayload,
} from "../../../_shared";

interface TransitionModalProps {
  applicant: Applicant;
  opened: boolean;
  onClose: () => void;
}

/** Forward-only stage targets from the current stage (§1.6). */
const FORWARD_STAGES: Record<LifecycleStage, LifecycleStage[]> = {
  interested: ["potential", "applicant"],
  potential: ["applicant"],
  applicant: [],
};

/**
 * Move an applicant through the funnel and/or change engagement status. Encodes the
 * contract's reason rules client-side for fast feedback (the server remains the source
 * of truth): the direct `interested → applicant` jump needs a reason, `→ potential`
 * needs an assessment id or an override reason, and adverse engagement statuses need a
 * reason.
 */
export function TransitionModal({
  applicant,
  opened,
  onClose,
}: TransitionModalProps) {
  const [stage, setStage] = useState<string>("");
  const [engagement, setEngagement] = useState<string>("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [assessmentId, setAssessmentId] = useState("");

  const reset = () => {
    setStage("");
    setEngagement("");
    setReason("");
    setNotes("");
    setAssessmentId("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const mutation = useApplicantMutation<Applicant, TransitionPayload>({
    mutationFn: (payload) => transitionApplicant(applicant.id, payload),
    successTitle: "Applicant updated",
    successMessage: "The lifecycle change was recorded.",
    errorTitle: "Couldn't update applicant",
    invalidateKeys: [applicantKeys.lists(), applicantKeys.detail(applicant.id)],
    onSuccess: handleClose,
  });

  const stageOptions = FORWARD_STAGES[applicant.lifecycle_stage].map((s) => ({
    value: s,
    label: LIFECYCLE_STAGE_LABELS[s],
  }));

  const engagementOptions = (
    Object.keys(ENGAGEMENT_STATUS_LABELS) as EngagementStatus[]
  )
    .filter((s) => s !== applicant.engagement_status && s !== "archived")
    .map((s) => ({ value: s, label: ENGAGEMENT_STATUS_LABELS[s] }));

  const { reasonRequired, hint } = useMemo(() => {
    const messages: string[] = [];
    let required = false;
    if (stage === "applicant" && applicant.lifecycle_stage === "interested") {
      required = true;
      messages.push("A reason is required to skip straight to Applicant.");
    }
    if (stage === "potential" && !assessmentId.trim()) {
      required = true;
      messages.push(
        "Moving to Potential needs a qualification assessment id or a reason.",
      );
    }
    if (
      engagement &&
      ENGAGEMENT_REASON_REQUIRED.includes(engagement as EngagementStatus)
    ) {
      required = true;
      messages.push("A reason is required for this engagement status.");
    }
    return { reasonRequired: required, hint: messages.join(" ") };
  }, [stage, engagement, assessmentId, applicant.lifecycle_stage]);

  const nothingChosen = !stage && !engagement;
  const reasonMissing = reasonRequired && !reason.trim();
  const disabled = nothingChosen || reasonMissing;

  const handleSubmit = () => {
    const payload: TransitionPayload = {
      record_version: applicant.record_version,
    };
    if (stage) payload.lifecycle_stage = stage as LifecycleStage;
    if (engagement) payload.engagement_status = engagement as EngagementStatus;
    if (reason.trim()) payload.reason = reason.trim();
    if (notes.trim()) payload.notes = notes.trim();
    if (assessmentId.trim())
      payload.qualification_assessment_id = assessmentId.trim();
    mutation.mutate(payload);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Change lifecycle"
      centered
    >
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          Current: {LIFECYCLE_STAGE_LABELS[applicant.lifecycle_stage]} ·{" "}
          {ENGAGEMENT_STATUS_LABELS[applicant.engagement_status]}
        </Text>

        <Select
          label="Move to stage"
          placeholder={
            stageOptions.length ? "No change" : "Already at final stage"
          }
          clearable
          disabled={stageOptions.length === 0}
          data={stageOptions}
          value={stage}
          onChange={(v) => setStage(v ?? "")}
        />

        <Select
          label="Engagement status"
          placeholder="No change"
          clearable
          data={engagementOptions}
          value={engagement}
          onChange={(v) => setEngagement(v ?? "")}
        />

        {stage === "potential" && (
          <TextInput
            label="Qualification assessment id"
            description="Optional — provide this or a reason to move to Potential."
            value={assessmentId}
            onChange={(e) => setAssessmentId(e.currentTarget.value)}
          />
        )}

        <Textarea
          label="Reason"
          required={reasonRequired}
          autosize
          minRows={2}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
        />
        <Textarea
          label="Notes"
          autosize
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />

        {hint && (
          <Alert color="blue" variant="light" py="xs">
            {hint}
          </Alert>
        )}

        <Group justify="flex-end" gap="xs">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={mutation.isPending}
            disabled={disabled}
          >
            Apply
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
