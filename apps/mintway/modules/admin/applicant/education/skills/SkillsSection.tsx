"use client";

import { createChildResource } from "../../_shared";
import type { Skill } from "../../_shared";
import { SkillForm } from "./SkillForm";
import type { SkillPayload } from "./SkillForm.types";
import { skillColumns } from "./skills.columns";

/**
 * Skill CRUD table for the current applicant (§9). Admin-only nested resource; a
 * locked/archived parent is rejected server-side and surfaced by the shell.
 */
export const SkillsSection = createChildResource<
  Skill,
  SkillPayload,
  SkillPayload
>({
  slug: "skills",
  moduleInfo: {
    name: "skill",
    label: "Skills",
    description: "Applicant skills and proficiency",
  },
  columns: skillColumns,
  createFormComponent: SkillForm,
  createModalTitle: "Add skill",
  editModalTitle: "Edit skill",
  modalWidth: 560,
});
