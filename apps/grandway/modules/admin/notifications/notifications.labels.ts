"use client";

import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { HourglassIcon } from "@phosphor-icons/react/dist/csr/Hourglass";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { CertificateIcon } from "@phosphor-icons/react/dist/csr/Certificate";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { AlarmIcon } from "@phosphor-icons/react/dist/csr/Alarm";
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { FileXIcon } from "@phosphor-icons/react/dist/csr/FileX";
import { MapTrifoldIcon } from "@phosphor-icons/react/dist/csr/MapTrifold";
import { FlagIcon } from "@phosphor-icons/react/dist/csr/Flag";
import { GavelIcon } from "@phosphor-icons/react/dist/csr/Gavel";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { UserSwitchIcon } from "@phosphor-icons/react/dist/csr/UserSwitch";
import { UserCheckIcon } from "@phosphor-icons/react/dist/csr/UserCheck";
import { UserMinusIcon } from "@phosphor-icons/react/dist/csr/UserMinus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { ArrowUUpLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowUUpLeft";
import { NotepadIcon } from "@phosphor-icons/react/dist/csr/Notepad";
import { SealCheckIcon } from "@phosphor-icons/react/dist/csr/SealCheck";
import type { Icon } from "@phosphor-icons/react";
import type {
  DueBucket,
  NotificationCategory,
  NotificationPriority,
  NotificationType,
} from "./notifications.types";

/** Human labels for all 25 declared types (§5) — the never-produced ones are labelled too, per contract guidance to render them if they ever arrive. */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  checklist_item_due: "Checklist item due",
  checklist_item_overdue: "Checklist item overdue",
  missing_documents: "Missing documents",
  missing_information: "Missing information",
  offer_response_due: "Offer response due",
  offer_expired: "Offer expired",
  passport_expiring: "Passport expiring",
  test_score_expiring: "Test score expiring",
  appointment_reminder: "Appointment reminder",
  // Named for what staff called it when they set it, not for the wire value —
  // "Custom reminder" would describe the plumbing rather than the thing.
  custom_reminder: "Follow-up reminder",
  assignment_received: "Assignment received",
  file_rejected: "File rejected",
  journey_stage_changed: "Journey stage changed",
  journey_closed: "Journey closed",
  offer_decided: "Offer decision recorded",
  lead_created: "New lead",
  lead_converted: "Lead converted",
  lead_deleted: "Lead deleted",
  lead_restored: "Lead restored",
  applicant_status_changed: "Applicant status changed",
  applicant_restored: "Applicant restored",
  applicant_assigned: "Applicant assigned to you",
  applicant_unassigned: "Applicant taken off you",
  visit_note_added: "Office visit noted",
  document_ready: "Document ready",
};

/** One icon per type, for scanability in a mixed feed. */
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, Icon> = {
  checklist_item_due: ClockIcon,
  checklist_item_overdue: WarningIcon,
  missing_documents: FileTextIcon,
  missing_information: InfoIcon,
  offer_response_due: PaperPlaneTiltIcon,
  offer_expired: HourglassIcon,
  passport_expiring: IdentificationCardIcon,
  test_score_expiring: CertificateIcon,
  appointment_reminder: CalendarBlankIcon,
  // The same icon the applicant/client Reminders tab uses, so the alert and the
  // record panel it came from read as one feature.
  custom_reminder: AlarmIcon,
  assignment_received: ClipboardTextIcon,
  file_rejected: FileXIcon,
  journey_stage_changed: MapTrifoldIcon,
  journey_closed: FlagIcon,
  offer_decided: GavelIcon,
  lead_created: UserPlusIcon,
  lead_converted: UserSwitchIcon,
  lead_deleted: TrashIcon,
  lead_restored: ArrowCounterClockwiseIcon,
  applicant_status_changed: ArrowsLeftRightIcon,
  applicant_restored: ArrowUUpLeftIcon,
  applicant_assigned: UserCheckIcon,
  applicant_unassigned: UserMinusIcon,
  visit_note_added: NotepadIcon,
  document_ready: SealCheckIcon,
};

/**
 * Fixed per type at creation (§5): `offer_expired` is `urgent`;
 * `checklist_item_overdue`/`offer_response_due`/`passport_expiring`/
 * `test_score_expiring`/`file_rejected` are `high`; `journey_stage_changed`/
 * `lead_restored`/`applicant_unassigned`/`visit_note_added` are `low`;
 * everything else is `normal`. Always read `priority` from the payload —
 * this map is display-only, never used to recompute it.
 */
export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: "gray",
  normal: "blue",
  high: "orange",
  urgent: "red",
};

/** Every category, in the order the settings surface lists them (by who/what the alert is about). */
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "lead",
  "applicant_status",
  "assignment",
  "notes",
  "journey",
  "checklist",
  "follow_up",
  "documents",
  "file",
  "offer",
  "expiry",
];

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  lead: "Leads",
  applicant_status: "Applicant status",
  journey: "Journeys",
  assignment: "Assignments",
  notes: "Visit notes",
  follow_up: "Follow-ups",
  documents: "Documents",
  checklist: "Checklists",
  offer: "Offers",
  file: "Files",
  expiry: "Expiry dates",
};

/** Plain description of what each category covers — shown under its switch in settings. */
export const CATEGORY_DESCRIPTIONS: Record<NotificationCategory, string> = {
  lead: "A lead is created, converted to an applicant, deleted, or restored.",
  applicant_status:
    "An applicant's status changes (active, dormant, archived) or an archived applicant is restored.",
  journey: "An applicant's journey moves to a new stage or is closed.",
  assignment:
    "An applicant, checklist, or checklist item is assigned to you, or an applicant is taken off you.",
  notes: "Someone records an in-person office visit on a lead or applicant.",
  follow_up: "A follow-up reminder you or a colleague set comes due.",
  documents: "A document is marked ready (admins only).",
  checklist:
    "A checklist item is due or overdue, or a checklist still has documents nobody has collected.",
  offer:
    "An offer's response deadline is near or has passed, or an offer is decided.",
  file: "An uploaded file is rejected on review.",
  expiry: "A passport or language test score has expired or is about to.",
};

/**
 * Eleven tabs would overrun a 480px drawer and most are rarely non-empty, so the
 * inbox groups categories by the question a reader is asking. Every category
 * appears in exactly one group. `categories` is empty for "All" (no filter).
 */
export interface InboxTabGroup {
  value: string;
  label: string;
  categories: NotificationCategory[];
}

/** The unfiltered tab — also the fallback when a stored tab value matches nothing. */
export const ALL_TAB_GROUP: InboxTabGroup = {
  value: "all",
  label: "All",
  categories: [],
};

export const INBOX_TAB_GROUPS: InboxTabGroup[] = [
  ALL_TAB_GROUP,
  { value: "leads", label: "Leads", categories: ["lead"] },
  {
    value: "applicants",
    label: "Applicants",
    categories: ["applicant_status", "assignment", "notes", "journey"],
  },
  { value: "tasks", label: "Tasks", categories: ["checklist", "follow_up"] },
  {
    value: "deadlines",
    label: "Offers & expiry",
    categories: ["offer", "expiry"],
  },
  { value: "files", label: "Files", categories: ["documents", "file"] },
];

export const DUE_BUCKET_LABELS: Record<DueBucket, string> = {
  overdue: "Overdue",
  due_soon: "Due soon",
  later: "Later",
  none: "No due date",
};

export const DUE_BUCKET_COLORS: Record<DueBucket, string> = {
  overdue: "red",
  due_soon: "orange",
  later: "blue",
  none: "gray",
};

/** Render order for the grouped inbox — most urgent first. */
export const DUE_BUCKET_ORDER: DueBucket[] = [
  "overdue",
  "due_soon",
  "later",
  "none",
];
