"use client";

import { z } from "zod";
import { Alert, Button, Stack, Textarea } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import type { ModalFormComponentProps } from "@peppermint/admin";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import type { OfferDetail, OfferUpdatePayload } from "../offers.types";
import { MoneyFields } from "./components/MoneyFields";
import { OfferBasicsFields } from "./components/OfferBasicsFields";
import type { OfferEditValues } from "./OfferEditForm.types";

const DECIMAL_RE = /^\d{1,10}(\.\d{1,2})?$/;

function toEditFormValues(d: Partial<OfferDetail>): OfferEditValues {
  return {
    offer_type: d.offer_type ?? "conditional",
    offer_reference: d.offer_reference ?? "",
    issue_date: d.issue_date ?? null,
    response_deadline: d.response_deadline ?? null,
    tuition_amount: d.tuition_amount ?? "",
    tuition_currency: d.tuition_currency ?? "",
    tuition_fee_period: d.tuition_fee_period ?? "",
    scholarship_amount: d.scholarship_amount ?? "",
    scholarship_currency: d.scholarship_currency ?? "",
    scholarship_notes: d.scholarship_notes ?? "",
    deposit_amount: d.deposit_amount ?? "",
    deposit_currency: d.deposit_currency ?? "",
    deposit_due_date: d.deposit_due_date ?? null,
    deposit_notes: d.deposit_notes ?? "",
    notes: d.notes ?? "",
  };
}

function amount(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function currency(value: string): string {
  return value.trim().toUpperCase();
}

/**
 * Diffs the edited values against the loaded offer and returns ONLY the fields
 * that changed (§3 — a PATCH must carry only changed mutable fields; immutable
 * fields aren't in the payload type at all, so they can never leak in). An
 * unchanged field is omitted so the backend writes no spurious audit event.
 */
function diffOfferUpdate(
  original: Partial<OfferDetail>,
  values: OfferEditValues,
): OfferUpdatePayload {
  const base = toEditFormValues(original);
  const payload: OfferUpdatePayload = {};

  if (values.offer_type !== base.offer_type)
    payload.offer_type = values.offer_type;
  if (values.offer_reference.trim() !== base.offer_reference)
    payload.offer_reference = values.offer_reference.trim();
  if ((values.issue_date || null) !== base.issue_date)
    payload.issue_date = values.issue_date || null;
  if ((values.response_deadline || null) !== base.response_deadline)
    payload.response_deadline = values.response_deadline || null;

  if (amount(values.tuition_amount) !== amount(base.tuition_amount))
    payload.tuition_amount = amount(values.tuition_amount);
  if (currency(values.tuition_currency) !== currency(base.tuition_currency))
    payload.tuition_currency = currency(values.tuition_currency);
  if (values.tuition_fee_period !== base.tuition_fee_period)
    payload.tuition_fee_period = values.tuition_fee_period;

  if (amount(values.scholarship_amount) !== amount(base.scholarship_amount))
    payload.scholarship_amount = amount(values.scholarship_amount);
  if (
    currency(values.scholarship_currency) !==
    currency(base.scholarship_currency)
  )
    payload.scholarship_currency = currency(values.scholarship_currency);
  if (values.scholarship_notes.trim() !== base.scholarship_notes)
    payload.scholarship_notes = values.scholarship_notes.trim();

  if (amount(values.deposit_amount) !== amount(base.deposit_amount))
    payload.deposit_amount = amount(values.deposit_amount);
  if (currency(values.deposit_currency) !== currency(base.deposit_currency))
    payload.deposit_currency = currency(values.deposit_currency);
  if ((values.deposit_due_date || null) !== base.deposit_due_date)
    payload.deposit_due_date = values.deposit_due_date || null;
  if (values.deposit_notes.trim() !== base.deposit_notes)
    payload.deposit_notes = values.deposit_notes.trim();

  if (values.notes.trim() !== base.notes) payload.notes = values.notes.trim();

  return payload;
}

function refineAmount(
  amt: string,
  cur: string,
  amountPath: string,
  currencyPath: string,
  ctx: z.RefinementCtx,
) {
  const trimmed = amt.trim();
  if (trimmed === "") return;
  if (!DECIMAL_RE.test(trimmed))
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [amountPath],
      message: "Enter a valid amount (up to 2 decimals)",
    });
  if (!cur.trim())
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [currencyPath],
      message: "Currency is required for this amount",
    });
}

// Money completeness is re-checked against the MERGED state (§7); the form holds
// every money field, so validating the whole value set covers it.
const editSchema = z
  .object({
    tuition_amount: z.string(),
    tuition_currency: z.string().max(3, "3-letter code"),
    scholarship_amount: z.string(),
    scholarship_currency: z.string().max(3, "3-letter code"),
    deposit_amount: z.string(),
    deposit_currency: z.string().max(3, "3-letter code"),
  })
  .passthrough()
  .superRefine((v, ctx) => {
    refineAmount(
      v.tuition_amount,
      v.tuition_currency,
      "tuition_amount",
      "tuition_currency",
      ctx,
    );
    refineAmount(
      v.scholarship_amount,
      v.scholarship_currency,
      "scholarship_amount",
      "scholarship_currency",
      ctx,
    );
    refineAmount(
      v.deposit_amount,
      v.deposit_currency,
      "deposit_amount",
      "deposit_currency",
      ctx,
    );
  });

/**
 * Edit form — the mutable subset only. The journey, catalogue reference, and
 * all six snapshot fields are immutable (§3) and simply aren't shown or sent.
 * Emits the diffed `OfferUpdatePayload` via `onSubmit`; the worklist's
 * `onEditApi` PATCHes it as-is.
 */
export function OfferEditForm({
  onSubmit,
  isLoading,
  initialValues,
}: ModalFormComponentProps<OfferDetail, OfferUpdatePayload>) {
  const initial = toEditFormValues(initialValues ?? {});

  return (
    <FormWrapper<OfferEditValues>
      initial={initial}
      validation={[editSchema]}
      hasDirtCheck
      finalSubmitFn={async (values) => {
        onSubmit(diffOfferUpdate(initialValues ?? {}, values));
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="blue"
          icon={<InfoIcon size={16} aria-hidden />}
          title="Only the offer's own particulars can change"
        >
          The journey, program reference, and snapshot details are fixed once an
          offer is created. To change those, record a new offer.
        </Alert>
        <OfferBasicsFields isLoading={isLoading} />
        <MoneyFields isLoading={isLoading} />
        <NotesField isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function NotesField({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<OfferEditValues>();
  return (
    <Textarea
      label="Notes"
      autosize
      minRows={2}
      disabled={isLoading}
      {...form.getInputProps("notes")}
    />
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save changes
    </Button>
  );
}
