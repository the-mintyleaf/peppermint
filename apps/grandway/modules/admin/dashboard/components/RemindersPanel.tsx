"use client";

import { useState } from "react";
import { AlarmIcon } from "@phosphor-icons/react/dist/csr/Alarm";
import { REMINDER_PREVIEW_ROWS, useDueReminders } from "../dashboard.hooks";
import { TONE_COLOR, toneForAlert } from "../dashboard.tone";
import type { DueRemindersBucket } from "../dashboard.hooks";
import { PanelCard } from "./PanelCard";
import { PreviewList } from "./PreviewList";
import { ReminderRowView } from "./ReminderRowView";
import { SectionState } from "./SectionState";

const VIEWS = [
  {
    value: "overdue",
    label: "Overdue",
    description: "Past their date and still open",
  },
  {
    value: "today",
    label: "Due today",
    description: "Due at the start of today, Nepal time",
  },
  {
    value: "upcoming",
    label: "Upcoming",
    description: "Open follow-ups still ahead of their date",
  },
] as const;

type ViewKey = (typeof VIEWS)[number]["value"];

const EMPTY_MESSAGE: Record<ViewKey, string> = {
  overdue: "Nothing overdue — every follow-up is on time.",
  today: "Nothing due today.",
  upcoming: "No follow-ups scheduled ahead.",
};

/** Severity each window carries **when it is non-zero**; at zero all read `good`. */
const BAND: Record<ViewKey, "critical" | "warning" | "info"> = {
  overdue: "critical",
  today: "warning",
  upcoming: "info",
};

/**
 * Staff-set follow-ups that are due — the ninth section on a page whose
 * contract has eight.
 *
 * **This card is why the feature works for half the staff.** A `custom_reminder`
 * alert is routed to Admins only, so a Lead Manager's own follow-ups surface
 * nowhere automatically; the reminders contract's §9 names this exact query as
 * the client-side answer. It therefore lives in the **Applicants** band — one
 * of the two a Lead Manager gets — and never in Operations, which is Admin-only
 * and would hide it from precisely the people with no other way to see their
 * due work.
 *
 * Every count here is a real server total (`meta.count` per window), never a
 * page length, so the card stays honest at any volume.
 */
export function RemindersPanel() {
  // `null` until the reader picks a view themselves. Their choice must survive
  // a refetch, so it is stored separately from the fallback below rather than
  // being seeded into state and then overwritten.
  const [chosenView, setChosenView] = useState<ViewKey | null>(null);
  const { buckets, isPending, isError, refetch, isRefetching } =
    useDueReminders();

  const bucketFor = (key: ViewKey): DueRemindersBucket => buckets[key];

  /**
   * Open on the most urgent view that actually has something in it.
   *
   * Defaulting to Overdue reads well and is wrong in the common case: a
   * reminder cannot be created in the past — `due_date` must be Nepal's today
   * or later — so a freshly set follow-up is *never* overdue and usually not
   * even due today. A card that always opened on Overdue therefore greeted
   * most offices with "Nothing overdue", which looks identical to a card with
   * no data, or no card at all.
   *
   * Falls back to Overdue when every window is empty, so the calm state is
   * still the reassuring one rather than an arbitrary tab.
   */
  const firstPopulated =
    VIEWS.find((entry) => bucketFor(entry.value).total > 0)?.value ?? "overdue";
  const view = chosenView ?? firstPopulated;
  const openTotal = VIEWS.reduce(
    (sum, entry) => sum + bucketFor(entry.value).total,
    0,
  );

  const views = VIEWS.map((entry) => ({
    ...entry,
    // Real total for the view, per `PanelCard`'s contract — `undefined` while
    // loading, because "we could not ask yet" must never render as zero.
    count: isPending ? undefined : bucketFor(entry.value).total,
  }));

  const current = bucketFor(view);
  // Tone is derived from the figure, never chosen here: an empty overdue queue
  // is a good outcome and reads calm, a non-empty one reads breached.
  const tone = TONE_COLOR[toneForAlert(current.total, BAND[view])];

  return (
    <PanelCard
      title="Follow-ups"
      // The open total rides in the subtitle so the card states its own size
      // even when the selected window happens to be empty — "0 open" and
      // "12 open, none overdue" are very different situations and used to look
      // the same from outside.
      subtitle={
        isPending
          ? undefined
          : `${openTotal} open · ${VIEWS.find((entry) => entry.value === view)?.description}`
      }
      icon={AlarmIcon}
      views={views}
      activeView={view}
      onViewChange={(value) => setChosenView(value as ViewKey)}
      minBodyHeight={300}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load follow-ups."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={300}
      >
        <PreviewList
          rows={current.rows.map((reminder) => (
            <ReminderRowView
              key={reminder.id}
              reminder={reminder}
              today={buckets.todayDate}
              tone={tone}
            />
          ))}
          total={current.total}
          // Driven by the server total against the preview depth, not by a
          // length check on the rows in hand.
          hasMore={current.total > REMINDER_PREVIEW_ROWS}
          // Reminders have no list route — they live on the record they belong
          // to — so "see all" points at the applicants list rather than
          // inventing a screen. The plain list, never a seeded filter.
          seeAllHref="/admin/applicants"
          emptyMessage={EMPTY_MESSAGE[view]}
          // Two caveats, both load-bearing given where this card sits. It
          // reads neither page filter, and — despite living in the Applicants
          // band — it covers client follow-ups too, because the reminders list
          // has no "any applicant" filter and dropping those rows client-side
          // would leave the counts describing a set the rows do not match.
          // Each row names its own owner type, so nothing is disguised.
          caption="Covers client follow-ups as well as applicant ones. Not narrowed by the fiscal-year or country filters."
        />
      </SectionState>
    </PanelCard>
  );
}
