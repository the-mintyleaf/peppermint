"use client";

import { createChildResource } from "../../_shared";
import type { LanguageEntry } from "../../_shared";
import { LanguageForm } from "./LanguageForm";
import type { LanguagePayload } from "./LanguageForm.types";
import { languageColumns } from "./languages.columns";

/**
 * Spoken-language CRUD table for the current applicant (§9). Admin-only nested resource;
 * a locked/archived parent is rejected server-side and surfaced by the shell.
 */
export const LanguagesSection = createChildResource<
  LanguageEntry,
  LanguagePayload,
  LanguagePayload
>({
  slug: "languages",
  moduleInfo: {
    name: "language",
    label: "Languages",
    description: "Spoken languages and proficiency",
  },
  columns: languageColumns,
  createFormComponent: LanguageForm,
  createModalTitle: "Add language",
  editModalTitle: "Edit language",
  modalWidth: 560,
});
