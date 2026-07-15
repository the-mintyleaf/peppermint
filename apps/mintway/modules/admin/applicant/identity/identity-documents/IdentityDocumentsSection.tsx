"use client";

import { createChildResource } from "../../_shared";
import type { IdentityDocument } from "../../_shared";
import { IdentityDocumentForm } from "./IdentityDocumentForm";
import type { IdentityDocumentPayload } from "./IdentityDocumentForm.types";
import { identityDocumentColumns } from "./identityDocuments.columns";

/** Identity documents CRUD for the current applicant (§5.2). Admin/superadmin only. */
export const IdentityDocumentsSection = createChildResource<
  IdentityDocument,
  IdentityDocumentPayload,
  IdentityDocumentPayload
>({
  slug: "identity-documents",
  moduleInfo: {
    name: "identity-document",
    label: "Identity documents",
    description: "Passports, citizenship, national IDs",
  },
  columns: identityDocumentColumns,
  createFormComponent: IdentityDocumentForm,
  createModalTitle: "Add identity document",
  editModalTitle: "Edit identity document",
  modalWidth: 640,
});
