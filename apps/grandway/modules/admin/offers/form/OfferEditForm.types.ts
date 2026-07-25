import type { OfferType, TuitionFeePeriod } from "../offers.types";

/**
 * FormWrapper value shape for editing an offer — the MUTABLE subset ONLY
 * (offer_type, offer_reference, dates, the nine money fields, notes). The
 * journey, catalogue refs, all six snapshot fields, `reference_source`,
 * `status`, and `conditions` are immutable and are deliberately absent — they
 * can never be edited (a PATCH carrying them is rejected, §3). See the
 * `*Values` `Record` exemption note in `OfferCreateForm.types.ts`.
 */
export interface OfferEditValues extends Record<string, unknown> {
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
}
