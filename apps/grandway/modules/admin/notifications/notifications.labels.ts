import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { HourglassIcon } from "@phosphor-icons/react/dist/csr/Hourglass";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { CertificateIcon } from "@phosphor-icons/react/dist/csr/Certificate";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { FileXIcon } from "@phosphor-icons/react/dist/csr/FileX";
import { MapTrifoldIcon } from "@phosphor-icons/react/dist/csr/MapTrifold";
import { FlagIcon } from "@phosphor-icons/react/dist/csr/Flag";
import { GavelIcon } from "@phosphor-icons/react/dist/csr/Gavel";
import type { Icon } from "@phosphor-icons/react";
import type {
  DueBucket,
  NotificationPriority,
  NotificationType,
} from "./notifications.types";

/** Human labels for all 14 declared types (§5) — the 3 never-produced ones are labelled too, per contract guidance to render them if they ever arrive. */
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
  assignment_received: "Assignment received",
  file_rejected: "File rejected",
  journey_stage_changed: "Journey stage changed",
  journey_closed: "Journey closed",
  offer_decided: "Offer decision recorded",
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
  assignment_received: ClipboardTextIcon,
  file_rejected: FileXIcon,
  journey_stage_changed: MapTrifoldIcon,
  journey_closed: FlagIcon,
  offer_decided: GavelIcon,
};

/**
 * Fixed per type at creation (§5): `offer_expired` is `urgent`;
 * `checklist_item_overdue`/`offer_response_due`/`passport_expiring`/
 * `test_score_expiring`/`file_rejected` are `high`; `journey_stage_changed` is
 * `low`; everything else is `normal`. Always read `priority` from the payload —
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
