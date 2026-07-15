"use client";

import { createChildResource } from "../../_shared";
import type { Consent } from "../../_shared";
import { ConsentForm } from "./ConsentForm";
import type { ConsentPayload } from "./ConsentForm.types";
import { consentColumns } from "./consents.columns";

/**
 * Consents CRUD table for the current applicant (§8). Admin-only; the server rejects a
 * locked/archived parent, surfaced by the shell's error resolver. Withdrawing a consent
 * stamps the withdrawal time server-side.
 */
export const ConsentsSection = createChildResource<
  Consent,
  ConsentPayload,
  ConsentPayload
>({
  slug: "consents",
  moduleInfo: {
    name: "consent",
    label: "Consents",
    description: "Data-processing and compliance consents captured",
  },
  columns: consentColumns,
  createFormComponent: ConsentForm,
  createModalTitle: "Add consent",
  editModalTitle: "Edit consent",
  modalWidth: 640,
});
