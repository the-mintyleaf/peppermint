"use client";

import { createChildResource } from "../../_shared";
import type { WorkExperience } from "../../_shared";
import { WorkExperienceForm } from "./WorkExperienceForm";
import type { WorkExperiencePayload } from "./WorkExperienceForm.types";
import { workExperienceColumns } from "./workExperiences.columns";

/**
 * Work-history CRUD table for the current applicant (§9). Admin-only nested
 * resource; a locked/archived parent is rejected server-side and surfaced by the
 * shell.
 */
export const WorkExperiencesSection = createChildResource<
  WorkExperience,
  WorkExperiencePayload,
  WorkExperiencePayload
>({
  slug: "work-experiences",
  moduleInfo: {
    name: "work-experience",
    label: "Work experience",
    description: "Employment history",
  },
  columns: workExperienceColumns,
  createFormComponent: WorkExperienceForm,
  createModalTitle: "Add work experience",
  editModalTitle: "Edit work experience",
  modalWidth: 640,
});
