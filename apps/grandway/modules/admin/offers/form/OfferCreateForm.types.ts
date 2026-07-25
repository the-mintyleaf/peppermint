import type {
  ConditionType,
  OfferType,
  QualificationLevel,
  TuitionFeePeriod,
} from "../offers.types";

/** How the offer's program reference is supplied: a catalogue pick or free text. */
export type ReferenceMode = "catalogue" | "manual";

/** One row of the inline conditions repeater on create. */
export interface ConditionDraft {
  condition_type: ConditionType;
  description: string;
  due_date: string | null;
}

/**
 * FormWrapper value shape for creating an offer. `extends Record<string,
 * unknown>` is the sanctioned `*Values` exemption — `FormWrapper<T>`'s generic
 * bound is stricter than a shell's `T extends object` (see `apps/grandway/docs/
 * AI.md` Conventions). Money amounts are decimal STRINGS (never numbers, §3);
 * `reference_source` is derived server-side and never held here.
 */
export interface OfferCreateValues extends Record<string, unknown> {
  journey: string;
  reference_mode: ReferenceMode;
  /** Catalogue mode — the program UUID (implies its institution + campus). */
  program: string | null;
  /** Manual mode — snapshot text (write-once, what the offer means). */
  institution_name: string;
  program_title: string;
  campus_name: string;
  country_name: string;
  qualification_level: QualificationLevel | "";
  intake_label: string;
  offer_type: OfferType;
  offer_reference: string;
  issue_date: string | null;
  response_deadline: string | null;
  tuition_amount: string;
  tuition_currency: string;
  tuition_fee_period: TuitionFeePeriod | "";
  scholarship_amount: string;
  scholarship_currency: string;
  scholarship_notes: string;
  deposit_amount: string;
  deposit_currency: string;
  deposit_due_date: string | null;
  deposit_notes: string;
  notes: string;
  conditions: ConditionDraft[];
}
