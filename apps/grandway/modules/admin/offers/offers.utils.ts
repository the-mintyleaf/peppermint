import { dayjs } from "@peppermint/ui";
import type { BsDate } from "./offers.types";

/**
 * Money is a decimal STRING (§3) — never parsed to a float. `null`/`""` amounts
 * render as an em dash; a present amount always carries its currency, since the
 * backend stores amounts exactly as quoted and never converts.
 */
export function formatMoney(
  amount: string | null | undefined,
  currency: string | null | undefined,
): string {
  if (amount == null || amount === "") return "—";
  return currency ? `${amount} ${currency}` : amount;
}

/**
 * User-facing date display. Reads the Gregorian field (`YYYY-MM-DD`) and, when
 * present, appends the BS sibling's `display` (§3 — read either). Never recomputes
 * BS locally.
 */
export function formatOfferDate(
  gregorian: string | null | undefined,
  bs?: BsDate | null,
): string {
  if (!gregorian) return "—";
  const formatted = dayjs(gregorian).format("MMM D, YYYY");
  return bs?.display ? `${formatted} (${bs.display})` : formatted;
}

/** ISO datetime → readable local string, `—` when null. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return dayjs(value).format("MMM D, YYYY h:mm A");
}
