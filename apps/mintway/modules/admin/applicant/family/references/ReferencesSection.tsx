"use client";

import { createChildResource } from "../../_shared";
import type { Reference } from "../../_shared";
import { ReferenceForm } from "./ReferenceForm";
import type { ReferencePayload } from "./ReferenceForm.types";
import { referenceColumns } from "./references.columns";

/**
 * References CRUD table for the current applicant (§9). Admin-permitted; the server
 * rejects a locked/archived parent, surfaced by the shell's error resolver.
 */
export const ReferencesSection = createChildResource<
  Reference,
  ReferencePayload,
  ReferencePayload
>({
  slug: "references",
  moduleInfo: {
    name: "reference",
    label: "References",
    description: "Referees supporting the applicant",
  },
  columns: referenceColumns,
  createFormComponent: ReferenceForm,
  createModalTitle: "Add reference",
  editModalTitle: "Edit reference",
  modalWidth: 640,
});
