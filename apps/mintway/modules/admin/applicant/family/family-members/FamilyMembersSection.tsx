"use client";

import { createChildResource } from "../../_shared";
import type { FamilyMember } from "../../_shared";
import { FamilyMemberForm } from "./FamilyMemberForm";
import type { FamilyMemberPayload } from "./FamilyMemberForm.types";
import { familyMemberColumns } from "./familyMembers.columns";

/**
 * Family members CRUD table for the current applicant (§9). Admin-permitted; the server
 * rejects a locked/archived parent, surfaced by the shell's error resolver.
 */
export const FamilyMembersSection = createChildResource<
  FamilyMember,
  FamilyMemberPayload,
  FamilyMemberPayload
>({
  slug: "family-members",
  moduleInfo: {
    name: "family-member",
    label: "Family members",
    description: "Relatives and financial sponsors",
  },
  columns: familyMemberColumns,
  createFormComponent: FamilyMemberForm,
  createModalTitle: "Add family member",
  editModalTitle: "Edit family member",
  modalWidth: 640,
});
