"use client";

import { FormShell, FormWrapper, useFormControls } from "@zetsel/admin";
import { createLoan } from "../module.api";
import { LOAN_FORM_INITIAL } from "./loanForm.initial";
import { loanDetailsSchema, loanDatesSchema, LOAN_STEP_FIELDS } from "./loanForm.schemas";
import { StepLoanDetails } from "./steps/StepLoanDetails";
import { StepDates }       from "./steps/StepDates";
import type { LoanFormValues } from "./loanForm.types";

const STEPS = [
  { label: "Loan Details", description: "Member & book selection" },
  { label: "Dates & Status", description: "Dates, status & notes" },
];

const STEP_COMPONENTS = [
  <StepLoanDetails key="loan-details" />,
  <StepDates       key="dates" />,
];

function LoanFormBody({ onBack }: { onBack: () => void }) {
  const { current, handleStepNext, handleStepBack } = useFormControls();
  return (
    <FormShell
      title="New Loan"
      description="Record a new book loan"
      onBack={onBack}
      steps={STEPS}
      showStepper
      showDirtyBanner={false}
      allowStepJump="completed-only"
      onStepNext={handleStepNext}
      onStepBack={handleStepBack}
    >
      {STEP_COMPONENTS[current]}
    </FormShell>
  );
}

interface LoanFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function LoanForm({ onBack, onSuccess }: LoanFormProps) {
  return (
    <FormWrapper<LoanFormValues>
      initial={LOAN_FORM_INITIAL}
      finalSubmitFn={async (data) => {
        await createLoan(data);
        onSuccess?.();
        return { ok: true };
      }}
      validation={[loanDetailsSchema, loanDatesSchema]}
      stepFields={LOAN_STEP_FIELDS}
      formClearOnSuccess
      hasDirtCheck
    >
      <LoanFormBody onBack={onBack} />
    </FormWrapper>
  );
}
