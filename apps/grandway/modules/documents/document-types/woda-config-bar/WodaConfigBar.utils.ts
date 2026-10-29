import { isWodaLineShown } from "@/components/templates/woda/WodaReferenceHeader";
import type { WodaContent } from "../../documents.types";
import type {
  WodaReferenceChange,
  WodaReferenceKey,
  WodaReferenceLine,
} from "./WodaConfigBar.types";

/** The two lines `WodaReferenceHeader` prints under the letterhead, in order. */
export const WODA_REFERENCE_LINES: readonly WodaReferenceLine[] = [
  {
    showKey: "show_refno",
    valueKey: "wodadoc_refno",
    switchLabel: "Print reference no.",
    inputLabel: "Reference no.",
    placeholder: "079/80-1234",
  },
  {
    showKey: "show_dispatch_no",
    valueKey: "dispatch_no",
    switchLabel: "Print dispatch no.",
    inputLabel: "Dispatch no.",
    placeholder: "512",
  },
];

const WODA_REFERENCE_KEYS: readonly WodaReferenceKey[] =
  WODA_REFERENCE_LINES.flatMap((line) => [line.showKey, line.valueKey]);

/**
 * Whether the line prints today. The same rule as the template
 * (`isWodaLineShown`): a stored switch wins; a letter saved before the switches
 * existed prints a number it has. Reading it this way means opening the panel
 * never changes the printout.
 */
export function isReferenceLineShown(
  content: WodaContent,
  line: WodaReferenceLine,
): boolean {
  return isWodaLineShown(content, line.showKey, line.valueKey);
}

/** The stored number for a line, as the input shows it. */
export function referenceLineValue(
  content: WodaContent,
  line: WodaReferenceLine,
): string {
  const value = content[line.valueKey];
  return typeof value === "string" ? value : "";
}

/** The switch turned on or off. The number is kept, so switching back restores it. */
export function switchChange(
  line: WodaReferenceLine,
  shown: boolean,
): WodaReferenceChange {
  const change: WodaReferenceChange = {};
  change[line.showKey] = shown;
  return change;
}

/**
 * The number edited. The switch is pinned on with it: on a letter saved without
 * the switch, clearing the number would otherwise flip the fallback to "hidden"
 * and take the input away mid-edit.
 */
export function valueChange(
  line: WodaReferenceLine,
  value: string,
): WodaReferenceChange {
  const change: WodaReferenceChange = {};
  change[line.showKey] = true;
  change[line.valueKey] = value;
  return change;
}

/**
 * The stored body with the panel's change on top. Only the changed keys are
 * written — every other key, and a switch the operator did not touch, stays
 * exactly as stored (an untouched, unset switch keeps its fallback).
 */
export function withWodaReferenceChange(
  content: WodaContent,
  change: WodaReferenceChange,
): WodaContent {
  return { ...content, ...change };
}

/**
 * `current` with the panel's four keys put back as they were in `saved` (a key
 * `saved` did not have is removed again). Everything else stays as `current`
 * has it, so undoing a refused save never undoes anything the panel did not do.
 */
export function restoreWodaReference(
  current: WodaContent,
  saved: WodaContent,
): WodaContent {
  const next: Record<string, unknown> = { ...current };
  for (const key of WODA_REFERENCE_KEYS) {
    if (key in saved) next[key] = saved[key];
    else delete next[key];
  }
  return next as WodaContent;
}
