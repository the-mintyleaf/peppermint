"use client";

import { createChildResource } from "../../_shared";
import type { QualificationAssessment } from "../../_shared";
import { AssessmentForm } from "./AssessmentForm";
import type { AssessmentPayload } from "./AssessmentForm.types";
import { assessmentColumns } from "./assessments.columns";

/**
 * Qualification assessments (§9) — append-only history. Create supersedes the prior
 * current assessment; edit + delete are disabled (the backend returns 405).
 */
export const AssessmentsSection = createChildResource<
  QualificationAssessment,
  AssessmentPayload,
  AssessmentPayload
>({
  slug: "qualification-assessments",
  moduleInfo: {
    name: "assessment",
    label: "Qualification assessments",
    description: "Eligibility assessments (append-only)",
  },
  columns: assessmentColumns,
  createFormComponent: AssessmentForm,
  createModalTitle: "Record assessment",
  modalWidth: 640,
  disableEdit: true,
  disableDelete: true,
  // No ordering override on purpose. gaps.md #9 carves out history/append-only
  // feeds as already newest-first, and this one is documented that way — while
  // `assessment_date` is optional and nullable, so pinning `-assessment_date`
  // would sort a freshly-created assessment with no date to the *bottom*, below
  // the superseded ones. The server default is the correct order here.
});
