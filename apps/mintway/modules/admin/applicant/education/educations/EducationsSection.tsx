"use client";

import { createChildResource } from "../../_shared";
import type { Education } from "../../_shared";
import { EducationForm } from "./EducationForm";
import type { EducationPayload } from "./EducationForm.types";
import { educationColumns } from "./educations.columns";

/**
 * Education CRUD table for the current applicant (§9). Admin-only nested resource;
 * a locked/archived parent is rejected server-side and surfaced by the shell.
 */
export const EducationsSection = createChildResource<
  Education,
  EducationPayload,
  EducationPayload
>({
  slug: "educations",
  moduleInfo: {
    name: "education",
    label: "Education",
    description: "Academic qualifications and study history",
  },
  columns: educationColumns,
  createFormComponent: EducationForm,
  createModalTitle: "Add education",
  editModalTitle: "Edit education",
  modalWidth: 720,
});
