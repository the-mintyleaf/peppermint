import { CERTIFICATE_SKILLS } from "./certificateContent";
import type { CertificateTab } from "./CertificateForm.types";

/** Tab order — the first tab holding an error is the one a failed save opens. */
export const CERTIFICATE_TABS: readonly CertificateTab[] = [
  "general",
  "attendance",
];

/** Top-level form fields shown on "Attendance & grades"; everything else is General. */
const ATTENDANCE_TAB_FIELDS = new Set<string>([
  "attendance",
  "course_hours_per_day",
  ...CERTIFICATE_SKILLS,
]);

/** The tab showing a form path (`attendance.3.present` → `"attendance"`). */
export function tabOfPath(path: string): CertificateTab {
  return ATTENDANCE_TAB_FIELDS.has(path.split(".")[0])
    ? "attendance"
    : "general";
}

/** The form paths that currently carry a message. */
export function errorPaths(errors: Record<string, unknown>): string[] {
  return Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([path]) => path);
}

/** How many fields on each tab carry an error — the count on the tab label. */
export function countErrorsByTab(
  errors: Record<string, unknown>,
): Record<CertificateTab, number> {
  const counts: Record<CertificateTab, number> = { general: 0, attendance: 0 };
  for (const path of errorPaths(errors)) counts[tabOfPath(path)] += 1;
  return counts;
}

/** The first tab (in tab order) holding one of `paths`, or `null` for none. */
export function firstTabWithError(paths: string[]): CertificateTab | null {
  const tabs = new Set(paths.map(tabOfPath));
  return CERTIFICATE_TABS.find((tab) => tabs.has(tab)) ?? null;
}
