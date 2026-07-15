"use client";

import { createChildResource } from "../../_shared";
import type { Sponsor } from "../../_shared";
import { SponsorForm } from "./SponsorForm";
import type { SponsorPayload } from "./SponsorForm.types";
import { sponsorColumns } from "./sponsors.columns";

/**
 * Sponsors CRUD table for the current applicant (§8). Admin-only; the server rejects a
 * locked/archived parent, surfaced by the shell's error resolver.
 */
export const SponsorsSection = createChildResource<
  Sponsor,
  SponsorPayload,
  SponsorPayload
>({
  slug: "sponsors",
  moduleInfo: {
    name: "sponsor",
    label: "Sponsors",
    description: "Financial sponsors backing the applicant",
  },
  columns: sponsorColumns,
  createFormComponent: SponsorForm,
  createModalTitle: "Add sponsor",
  editModalTitle: "Edit sponsor",
  modalWidth: 640,
});
