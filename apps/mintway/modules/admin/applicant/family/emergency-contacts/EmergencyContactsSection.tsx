"use client";

import { createChildResource } from "../../_shared";
import type { EmergencyContact } from "../../_shared";
import { EmergencyContactForm } from "./EmergencyContactForm";
import type { EmergencyContactPayload } from "./EmergencyContactForm.types";
import { emergencyContactColumns } from "./emergencyContacts.columns";

/**
 * Emergency contacts CRUD table for the current applicant (§9). Admin-permitted; the
 * server rejects a locked/archived parent, surfaced by the shell's error resolver.
 */
export const EmergencyContactsSection = createChildResource<
  EmergencyContact,
  EmergencyContactPayload,
  EmergencyContactPayload
>({
  slug: "emergency-contacts",
  moduleInfo: {
    name: "emergency-contact",
    label: "Emergency contacts",
    description: "People to reach in an emergency",
  },
  columns: emergencyContactColumns,
  createFormComponent: EmergencyContactForm,
  createModalTitle: "Add emergency contact",
  editModalTitle: "Edit emergency contact",
  modalWidth: 640,
});
