"use client";

import { createChildResource } from "../../_shared";
import type { AcademicGrading } from "../../_shared";
import { AcademicGradingForm } from "./AcademicGradingForm";
import type { AcademicGradingPayload } from "./AcademicGradingForm.types";
import { academicGradingColumns } from "./academicGradings.columns";

/**
 * Academic-grading CRUD table for the current applicant (§9). Admin-only nested
 * resource; a locked/archived parent is rejected server-side and surfaced by the shell.
 */
export const AcademicGradingsSection = createChildResource<
  AcademicGrading,
  AcademicGradingPayload,
  AcademicGradingPayload
>({
  slug: "academic-gradings",
  moduleInfo: {
    name: "academic-grading",
    label: "Academic gradings",
    description: "Period grading and attendance",
  },
  columns: academicGradingColumns,
  createFormComponent: AcademicGradingForm,
  createModalTitle: "Add grading",
  editModalTitle: "Edit grading",
  modalWidth: 720,
});
