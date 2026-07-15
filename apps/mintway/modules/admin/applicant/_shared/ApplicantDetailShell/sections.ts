import type { Icon } from "@phosphor-icons/react";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";
import { ChatCircleTextIcon } from "@phosphor-icons/react/dist/csr/ChatCircleText";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { UserSwitchIcon } from "@phosphor-icons/react/dist/csr/UserSwitch";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";

/** A section id — the URL segment under `/admin/applicants/[id]/` (`overview` = index). */
export type ApplicantSectionId =
  | "overview"
  | "addresses"
  | "identity"
  | "education"
  | "family"
  | "interests"
  | "crm"
  | "cases"
  | "assignments"
  | "history";

export interface ApplicantSection {
  id: ApplicantSectionId;
  label: string;
  icon: Icon;
  /** Admin/superadmin only — hidden from the staff tier (§8+). */
  adminOnly: boolean;
}

/**
 * Ordered detail sections. Staff reach `overview` + `addresses` (the staff-permitted
 * surface, §9.1); everything else is admin/superadmin-only and filtered from the nav
 * for staff (the routes themselves also gate).
 */
export const APPLICANT_SECTIONS: ApplicantSection[] = [
  { id: "overview", label: "Overview", icon: UserIcon, adminOnly: false },
  { id: "addresses", label: "Addresses", icon: MapPinIcon, adminOnly: false },
  {
    id: "identity",
    label: "Identity & media",
    icon: IdentificationCardIcon,
    adminOnly: true,
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCapIcon,
    adminOnly: true,
  },
  {
    id: "family",
    label: "Family & references",
    icon: UsersThreeIcon,
    adminOnly: true,
  },
  { id: "interests", label: "Interests", icon: CompassIcon, adminOnly: true },
  { id: "crm", label: "CRM", icon: ChatCircleTextIcon, adminOnly: true },
  { id: "cases", label: "Cases", icon: FolderIcon, adminOnly: true },
  {
    id: "assignments",
    label: "Assignments",
    icon: UserSwitchIcon,
    adminOnly: true,
  },
  {
    id: "history",
    label: "History",
    icon: ClockCounterClockwiseIcon,
    adminOnly: true,
  },
];

/** Href for a section under an applicant (`overview` is the index route). */
export function sectionHref(
  applicantId: string,
  id: ApplicantSectionId,
): string {
  return id === "overview"
    ? `/admin/applicants/${applicantId}`
    : `/admin/applicants/${applicantId}/${id}`;
}
