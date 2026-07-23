"use client";

import { Divider, Group, Stack, Text } from "@peppermint/ui";
import {
  OUTCOME_LABELS,
  STUDY_LEVEL_LABELS,
} from "../../../applicantJourneys.labels";
import type { ApplicantJourneyDetail } from "../../../applicantJourneys.types";

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md" align="flex-start">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" ta="right" c={value ? undefined : "dimmed"}>
        {value || "—"}
      </Text>
    </Group>
  );
}

/**
 * Objective fields first, then closure/deferment state — rendered only when
 * present, since exactly one of "active", "closed", or "deferred" applies to
 * any given journey (`stage`/`outcome`/`deferred_*` are mutually exclusive
 * by contract). `notes` is read-only here even though it's not part of
 * either write payload (`JourneyForm.types.ts`'s doc comment) — it's still a
 * genuine field on the detail response and worth showing if the backend
 * ever populates it (e.g. from lead conversion).
 */
export function JourneyOverviewPanel({
  journey,
}: {
  journey: ApplicantJourneyDetail;
}) {
  const isClosed = journey.stage === "completed" || journey.stage === "closed";
  const isDeferred = journey.stage === "deferred";

  return (
    <Stack gap="sm">
      <Divider label="Objective" labelPosition="left" />
      <Field
        label="Target institution"
        value={journey.target_institution_name}
      />
      <Field label="Target program" value={journey.target_program_name} />
      <Field
        label="Study level"
        value={
          journey.study_level ? STUDY_LEVEL_LABELS[journey.study_level] : null
        }
      />
      <Field label="Field of study" value={journey.field_of_study} />
      <Field label="Preferred intake" value={journey.preferred_intake} />
      <Field
        label="Budget"
        value={
          journey.budget_amount
            ? `${journey.budget_amount} ${journey.budget_currency}`
            : null
        }
      />
      <Field
        label="Scholarship interest"
        value={journey.scholarship_interest ? "Yes" : "No"}
      />
      {journey.notes ? <Field label="Notes" value={journey.notes} /> : null}

      {isClosed ? (
        <>
          <Divider label="How this ended" labelPosition="left" />
          <Field
            label="Outcome"
            value={journey.outcome ? OUTCOME_LABELS[journey.outcome] : null}
          />
          {journey.closure_reason ? (
            <Field label="Explanation" value={journey.closure_reason} />
          ) : null}
          <Field
            label="Closed at"
            value={
              journey.closed_at
                ? new Date(journey.closed_at).toLocaleString()
                : null
            }
          />
          <Field
            label="Closed by"
            value={
              journey.closed_by?.display_name ||
              journey.closed_by?.username ||
              null
            }
          />
        </>
      ) : null}

      {isDeferred ? (
        <>
          <Divider label="Deferment" labelPosition="left" />
          <Field
            label="Deferred to intake"
            value={journey.deferred_to_intake}
          />
          {journey.deferment_reason ? (
            <Field label="Reason" value={journey.deferment_reason} />
          ) : null}
          <Field
            label="Deferred at"
            value={
              journey.deferred_at
                ? new Date(journey.deferred_at).toLocaleString()
                : null
            }
          />
          <Field
            label="Deferred by"
            value={
              journey.deferred_by?.display_name ||
              journey.deferred_by?.username ||
              null
            }
          />
        </>
      ) : null}
    </Stack>
  );
}
