"use client";

import { z } from "zod";
import { Button, Stack, Text, Textarea, TextInput } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import type { ModalFormComponentProps } from "@peppermint/admin";
import { FormSection } from "@/components/FormSection";
import type { OfferCreatePayload, OfferDetail } from "../offers.types";
import { ConditionsRepeater } from "./components/ConditionsRepeater";
import { JourneyPickerField } from "./components/JourneyPickerField";
import { MoneyFields } from "./components/MoneyFields";
import { OfferBasicsFields } from "./components/OfferBasicsFields";
import { ReferenceFields } from "./components/ReferenceFields";
import type { OfferCreateValues } from "./OfferCreateForm.types";

const INITIAL: OfferCreateValues = {
  journey: "",
  reference_mode: "catalogue",
  program: null,
  institution_name: "",
  program_title: "",
  campus_name: "",
  country_name: "",
  qualification_level: "",
  intake_label: "",
  offer_type: "conditional",
  offer_reference: "",
  issue_date: null,
  response_deadline: null,
  tuition_amount: "",
  tuition_currency: "",
  tuition_fee_period: "",
  scholarship_amount: "",
  scholarship_currency: "",
  scholarship_notes: "",
  deposit_amount: "",
  deposit_currency: "",
  deposit_due_date: null,
  deposit_notes: "",
  notes: "",
  conditions: [],
};

const DECIMAL_RE = /^\d{1,10}(\.\d{1,2})?$/;

/** Mirror of the server's per-amount check: valid decimal, and a currency when an amount is present. */
function refineAmount(
  amount: string,
  currency: string,
  amountPath: string,
  currencyPath: string,
  ctx: z.RefinementCtx,
) {
  const trimmed = amount.trim();
  if (trimmed === "") return;
  if (!DECIMAL_RE.test(trimmed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [amountPath],
      message: "Enter a valid amount (up to 2 decimals)",
    });
  }
  if (!currency.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [currencyPath],
      message: "Currency is required for this amount",
    });
  }
}

const createSchema = z
  .object({
    journey: z.string().min(1, "Select a journey"),
    reference_mode: z.enum(["catalogue", "manual"]),
    program: z.string().nullable(),
    institution_name: z.string(),
    program_title: z.string(),
    tuition_amount: z.string(),
    tuition_currency: z.string().max(3, "3-letter code"),
    scholarship_amount: z.string(),
    scholarship_currency: z.string().max(3, "3-letter code"),
    deposit_amount: z.string(),
    deposit_currency: z.string().max(3, "3-letter code"),
  })
  .passthrough()
  .superRefine((v, ctx) => {
    if (v.reference_mode === "catalogue" && !v.program) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["program"],
        message: "Choose a catalogue program",
      });
    }
    if (v.reference_mode === "manual") {
      if (!v.institution_name.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["institution_name"],
          message: "Required",
        });
      }
      if (!v.program_title.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["program_title"],
          message: "Required",
        });
      }
    }
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
 * Maps form values to the create request body. In catalogue mode only the
 * `program` UUID is sent (the backend snapshots its names); in manual mode the
 * free-text snapshot fields are sent. `reference_source` is derived and never
 * sent. Blank-description condition rows are dropped; each surviving row gets a
 * `display_order` from its position.
 */
export function toOfferCreatePayload(v: OfferCreateValues): OfferCreatePayload {
  const base: OfferCreatePayload = {
    journey: v.journey,
    intake_label: v.intake_label.trim(),
    offer_type: v.offer_type,
    offer_reference: v.offer_reference.trim(),
    issue_date: v.issue_date || null,
    response_deadline: v.response_deadline || null,
    tuition_amount: v.tuition_amount.trim() || null,
    tuition_currency: v.tuition_currency.trim().toUpperCase(),
    tuition_fee_period: v.tuition_fee_period,
    scholarship_amount: v.scholarship_amount.trim() || null,
    scholarship_currency: v.scholarship_currency.trim().toUpperCase(),
    scholarship_notes: v.scholarship_notes.trim(),
    deposit_amount: v.deposit_amount.trim() || null,
    deposit_currency: v.deposit_currency.trim().toUpperCase(),
    deposit_due_date: v.deposit_due_date || null,
    deposit_notes: v.deposit_notes.trim(),
    notes: v.notes.trim(),
    conditions: v.conditions
      .filter((c) => c.description.trim())
      .map((c, index) => ({
        condition_type: c.condition_type,
        description: c.description.trim(),
        due_date: c.due_date || null,
        display_order: index,
      })),
  };
  if (v.reference_mode === "catalogue") {
    return { ...base, program: v.program };
  }
  return {
    ...base,
    institution_name: v.institution_name.trim(),
    program_title: v.program_title.trim(),
    campus_name: v.campus_name.trim(),
    country_name: v.country_name.trim(),
    qualification_level: v.qualification_level,
  };
}

/**
 * Create-only form (`POST /api/v1/offers/`). Typed against `OfferDetail` as the
 * record generic (no `initialValues` on create) so it stays interchangeable
 * with the shell's `Offer` row type. Emits raw values; the worklist maps them
 * via `toOfferCreatePayload` on `onCreateApi`.
 */
export function OfferCreateForm({
  onSubmit,
  isLoading,
}: ModalFormComponentProps<OfferDetail, OfferCreateValues>) {
  return (
    <FormWrapper<OfferCreateValues>
      initial={INITIAL}
      validation={[createSchema]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <JourneyPickerField isLoading={isLoading} />
        <OfferFormBody isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

/**
 * Everything after the applicant picker. Hidden until a journey is chosen so the
 * form reveals itself one decision at a time — nothing else is answerable before
 * the offer's journey is known.
 */
function OfferFormBody({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<OfferCreateValues>();
  if (!form.values.journey) return null;
  return (
    <>
      <ReferenceFields isLoading={isLoading} />
      <IntakeField isLoading={isLoading} />
      <FormSection title="Offer details">
        <OfferBasicsFields isLoading={isLoading} />
      </FormSection>
      <MoneyFields isLoading={isLoading} />
      <NotesField isLoading={isLoading} />
      <ConditionsRepeater isLoading={isLoading} />
      <SubmitButton isLoading={isLoading} />
    </>
  );
}

function IntakeField({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<OfferCreateValues>();
  return (
    <TextInput
      label="Intake"
      description="Free text — intakes aren't catalogued (e.g. Feb 2027)"
      placeholder="February 2027"
      disabled={isLoading}
      {...form.getInputProps("intake_label")}
    />
  );
}

function NotesField({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<OfferCreateValues>();
  return (
    <Textarea
      label="Notes"
      placeholder="Anything else worth recording about this offer"
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
    <>
      <Text size="xs" c="dimmed">
        The offer is created as a draft. Issue it and record the decision from
        the offer&apos;s page.
      </Text>
      <Button
        onClick={handleSubmit}
        loading={isLoading || submitting}
        fullWidth
      >
        Create offer
      </Button>
    </>
  );
}
