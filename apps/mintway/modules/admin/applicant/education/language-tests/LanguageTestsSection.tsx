"use client";

import { createChildResource } from "../../_shared";
import type { LanguageTest } from "../../_shared";
import { LanguageTestForm } from "./LanguageTestForm";
import type { LanguageTestPayload } from "./LanguageTestForm.types";
import { languageTestColumns } from "./languageTests.columns";

/**
 * Language-test CRUD table for the current applicant (§9). Admin-only nested resource;
 * scores are range-validated per test_type server-side (400 on out-of-range).
 */
export const LanguageTestsSection = createChildResource<
  LanguageTest,
  LanguageTestPayload,
  LanguageTestPayload
>({
  slug: "language-tests",
  moduleInfo: {
    name: "language-test",
    label: "Language tests",
    description: "IELTS / PTE / TOEFL / Duolingo results",
  },
  columns: languageTestColumns,
  createFormComponent: LanguageTestForm,
  createModalTitle: "Add language test",
  editModalTitle: "Edit language test",
  modalWidth: 720,
});
