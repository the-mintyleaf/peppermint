"use client";

import { createChildResource } from "../../_shared";
import type { VisaHistory } from "../../_shared";
import { VisaHistoryForm } from "./VisaHistoryForm";
import type { VisaHistoryPayload } from "./VisaHistoryForm.types";
import { visaHistoryColumns } from "./visaHistory.columns";

/**
 * Visa-history CRUD table for the current applicant (§8). Admin-only; the server rejects
 * a locked/archived parent, surfaced by the shell's error resolver.
 */
export const VisaHistorySection = createChildResource<
  VisaHistory,
  VisaHistoryPayload,
  VisaHistoryPayload
>({
  slug: "visa-history",
  moduleInfo: {
    name: "visa-history",
    label: "Visa history",
    description: "Prior visa applications and their decisions",
  },
  columns: visaHistoryColumns,
  createFormComponent: VisaHistoryForm,
  createModalTitle: "Add visa history",
  editModalTitle: "Edit visa history",
  modalWidth: 640,
});
