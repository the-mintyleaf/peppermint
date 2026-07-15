"use client";

import { createChildResource } from "../../_shared";
import type { TravelHistory } from "../../_shared";
import { TravelHistoryForm } from "./TravelHistoryForm";
import type { TravelHistoryPayload } from "./TravelHistoryForm.types";
import { travelHistoryColumns } from "./travelHistory.columns";

/**
 * Travel-history CRUD table for the current applicant (§8). Admin-only; the server
 * rejects a locked/archived parent, surfaced by the shell's error resolver.
 */
export const TravelHistorySection = createChildResource<
  TravelHistory,
  TravelHistoryPayload,
  TravelHistoryPayload
>({
  slug: "travel-history",
  moduleInfo: {
    name: "travel-history",
    label: "Travel history",
    description: "Countries the applicant has previously travelled to",
  },
  columns: travelHistoryColumns,
  createFormComponent: TravelHistoryForm,
  createModalTitle: "Add travel history",
  editModalTitle: "Edit travel history",
  modalWidth: 640,
});
