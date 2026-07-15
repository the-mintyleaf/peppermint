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
});
