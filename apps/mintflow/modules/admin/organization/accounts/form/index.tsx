"use client";

import { useFormControls, FormShell, FormWrapper } from "@peppermint/admin";
import { personalInfoSchema, rolePermissionsSchema, ACCOUNTS_STEP_FIELDS } from "./accountsForm.schemas";
import { ACCOUNTS_FORM_INITIAL } from "./accountsForm.initial";
import { StepPersonalInfo } from "./steps/StepPersonalInfo";
import { StepRolePermissions } from "./steps/StepRolePermissions";
import { createAccount, updateAccount } from "../accounts.api";
import type { AccountFormValues } from "./accountsForm.types";
import type { Account } from "../accounts.types";

const STEPS = [
  { label: "Personal Info", description: "Name, birthday & address" },
  { label: "Role & Permissions", description: "Assign role and override permissions" },
];

const STEP_COMPONENTS = [
  <StepPersonalInfo key="personal-info" />,
  <StepRolePermissions key="role-permissions" />,
];

function AccountFormBody({ onBack }: { onBack: () => void }) {
  const { current, handleStepNext, handleStepBack } = useFormControls();

  return (
    <FormShell
      title="Account"
      description="Fill all steps to save the account"
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

interface AccountFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  initialValues?: Account;
}

export function AccountForm({ onBack, onSuccess, initialValues }: AccountFormProps) {
  const initial: AccountFormValues = initialValues
    ? {
        fullName: initialValues.fullName,
        address: initialValues.address,
        birthday: initialValues.birthday,
        roleId: initialValues.roleId ?? "",
        personalizedPermissions: initialValues.personalizedPermissions,
        status: initialValues.status,
      }
    : ACCOUNTS_FORM_INITIAL;

  return (
    <FormWrapper<AccountFormValues>
      initial={initial}
      finalSubmitFn={async (data) => {
        if (initialValues?.id) {
          await updateAccount(initialValues.id, {
            ...(data as Partial<import("../accounts.types").Account>),
            roleName: null,
          });
        } else {
          await createAccount({ ...(data as Partial<import("../accounts.types").Account>), roleName: null });
        }
        onSuccess?.();
        return { ok: true };
      }}
      validation={[personalInfoSchema, rolePermissionsSchema]}
      stepFields={ACCOUNTS_STEP_FIELDS}
      formClearOnSuccess
      hasDirtCheck
    >
      <AccountFormBody onBack={onBack} />
    </FormWrapper>
  );
}
