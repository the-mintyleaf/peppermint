"use client";

import { Alert, Divider, Group, Stack, Text } from "@peppermint/ui";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";
import {
  OFFER_STATUS_LABELS,
  OFFER_TYPE_LABELS,
  QUALIFICATION_LEVEL_LABELS,
  TUITION_FEE_PERIOD_LABELS,
} from "../../../offers.labels";
import type { OfferDetail } from "../../../offers.types";
import {
  formatDateTime,
  formatMoney,
  formatOfferDate,
} from "../../../offers.utils";

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md" align="flex-start">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text
        size="xs"
        ta="right"
        c={value && value !== "—" ? undefined : "dimmed"}
      >
        {value || "—"}
      </Text>
    </Group>
  );
}

/**
 * The offer's write-once snapshot, money terms, and (once decided) the recorded
 * decision. Everything shown is the offer's own stored snapshot — never a fresh
 * catalogue fetch (§3). Every money figure renders its currency; amounts are
 * decimal strings shown verbatim, never converted.
 */
export function OfferSummaryPanel({ offer }: { offer: OfferDetail }) {
  const tuition = formatMoney(offer.tuition_amount, offer.tuition_currency);
  const scholarship = formatMoney(
    offer.scholarship_amount,
    offer.scholarship_currency,
  );
  const deposit = formatMoney(offer.deposit_amount, offer.deposit_currency);

  return (
    <Stack gap="sm">
      <Divider label="Program & reference" labelPosition="left" />
      <Field label="Institution" value={offer.institution_name} />
      <Field label="Campus" value={offer.campus_name} />
      <Field label="Program" value={offer.program_title} />
      <Field label="Country" value={offer.country_name} />
      <Field
        label="Qualification level"
        value={
          offer.qualification_level
            ? QUALIFICATION_LEVEL_LABELS[offer.qualification_level]
            : null
        }
      />
      <Field label="Intake" value={offer.intake_label} />
      <Field label="Offer type" value={OFFER_TYPE_LABELS[offer.offer_type]} />
      <Field
        label="Reference source"
        value={offer.reference_source === "catalogue" ? "Catalogue" : "Manual"}
      />
      <Field label="Offer reference" value={offer.offer_reference} />
      <Field
        label="Issue date"
        value={formatOfferDate(offer.issue_date, offer.issue_date_bs)}
      />
      <Field
        label="Response deadline"
        value={formatOfferDate(
          offer.response_deadline,
          offer.response_deadline_bs,
        )}
      />

      <Divider label="Money" labelPosition="left" />
      <Field
        label="Tuition"
        value={
          tuition === "—"
            ? null
            : offer.tuition_fee_period
              ? `${tuition} · ${TUITION_FEE_PERIOD_LABELS[offer.tuition_fee_period]}`
              : tuition
        }
      />
      <Field
        label="Scholarship"
        value={scholarship === "—" ? null : scholarship}
      />
      {offer.scholarship_notes ? (
        <Field label="Scholarship notes" value={offer.scholarship_notes} />
      ) : null}
      <Field label="Deposit" value={deposit === "—" ? null : deposit} />
      {offer.deposit_due_date ? (
        <Field
          label="Deposit due"
          value={formatOfferDate(
            offer.deposit_due_date,
            offer.deposit_due_date_bs,
          )}
        />
      ) : null}
      {offer.deposit_notes ? (
        <Field label="Deposit notes" value={offer.deposit_notes} />
      ) : null}

      {offer.notes ? (
        <>
          <Divider label="Notes" labelPosition="left" />
          <Text size="xs">{offer.notes}</Text>
        </>
      ) : null}

      {offer.is_terminal ? (
        <>
          <Divider label="Decision" labelPosition="left" />
          <Field label="Outcome" value={OFFER_STATUS_LABELS[offer.status]} />
          {offer.decision_reason ? (
            <Field label="Reason" value={offer.decision_reason} />
          ) : null}
          {offer.deferred_to_intake ? (
            <Field
              label="Deferred to intake"
              value={offer.deferred_to_intake}
            />
          ) : null}
          <Field label="Decided at" value={formatDateTime(offer.decided_at)} />
          <Field label="Decided by" value={offer.decided_by_username || null} />
        </>
      ) : null}

      <Alert
        variant="light"
        color="gray"
        icon={<PaperclipIcon size={16} aria-hidden />}
        title="Offer letter"
      >
        The offer letter PDF isn&apos;t stored on the offer itself — it lives in
        the separate files module. Attach or download it from there.
      </Alert>
    </Stack>
  );
}
