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
  Textarea,
} from "@peppermint/ui";

import {
  applicantKeys,
  engagementTargets,
  ENGAGEMENT_REASON_REQUIRED,
  ENGAGEMENT_STATUS_LABELS,
  FORWARD_STAGES,
  LIFECYCLE_STAGE_LABELS,
  transitionApplicant,
  useApplicantMutation,
} from "../../../_shared";
import type {
  Applicant,
  ApplicantActionTarget,
  EngagementStatus,
  LifecycleStage,
  TransitionPayload,
} from "../../../_shared";
import {
  useApplicantRecordVersion,
  useAssessmentOptions,
} from "./TransitionModal.hooks";

export interface TransitionModalProps {
  applicant: ApplicantActionTarget;
  opened: boolean;
  onClose: () => void;
  /** Pre-select the "Move to stage" field when opened from the Stage switch. */
  initialStage?: LifecycleStage;
  /** Pre-select the "Engagement status" field when opened from the Engagement switch. */
  initialEngagement?: EngagementStatus;
}

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
  initialStage,
  initialEngagement,
}: TransitionModalProps) {
  // Seeded once on mount from the picked target. Opening from a Stage/Engagement switch
  // pre-selects that choice; the row menu opens blank. Callers force a fresh seed per
  // open by remounting with a changing `key` (uncontrolled-with-key over an effect).
  const [stage, setStage] = useState<string>(initialStage ?? "");
  const [engagement, setEngagement] = useState<string>(initialEngagement ?? "");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [assessmentId, setAssessmentId] = useState("");

  // The `→ potential` move needs a real assessment id of this applicant, so we offer the
  // actual records — fetched only while the Potential branch is showing (§9.1).
  const {
    options: assessmentOptions,
    isLoading: assessmentsLoading,
    isError: assessmentsError,
  } = useAssessmentOptions(applicant.id, opened && stage === "potential");

  // The list projection omits `record_version` and the server bumps it after each
  // transition, so refetch the fresh value rather than trust the row we were handed.
  const {
    recordVersion,
    isLoading: versionLoading,
    isError: versionError,
  } = useApplicantRecordVersion(applicant.id, opened);
  // No fallback to `applicant.record_version`: on a list row it is absent (the
  // projection omits it) and on a detail record it may be stale. Either way it is
  // not safe to write with — block submit until the fresh value arrives instead.
  const effectiveVersion = recordVersion;

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

  const engagementOptions = engagementTargets(applicant.engagement_status).map(
    (s) => ({ value: s, label: ENGAGEMENT_STATUS_LABELS[s] }),
  );

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
  const versionMissing = effectiveVersion === undefined;
  const disabled =
    nothingChosen || reasonMissing || versionMissing || versionLoading;

  const handleSubmit = () => {
    if (effectiveVersion === undefined) return;
    const payload: TransitionPayload = {
      record_version: effectiveVersion,
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
      styles={{ body: { padding: "var(--mantine-spacing-md)" } }}
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
          <Select
            label="Qualification assessment"
            placeholder={
              assessmentsLoading
                ? "Loading assessments…"
                : assessmentOptions.length
                  ? "Select an assessment"
                  : "No assessments recorded"
            }
            description="Pick a recorded assessment, or leave blank and give a reason to move to Potential."
            clearable
            searchable
            disabled={assessmentsLoading || assessmentOptions.length === 0}
            data={assessmentOptions}
            value={assessmentId || null}
            onChange={(v) => setAssessmentId(v ?? "")}
            error={assessmentsError ? "Couldn't load assessments" : undefined}
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

        {versionError && versionMissing && (
          <Alert color="red" variant="light" py="xs">
            Couldn&apos;t load the applicant&apos;s current record — reopen this
            dialog to try again before changing the lifecycle.
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
