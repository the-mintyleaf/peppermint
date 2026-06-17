"use client";

import { FormShell, FormWrapper, useFormControls } from "@peppermint/admin";
import { createOrgUnit, updateOrgUnit } from "../module.api";
import type { OrganizationUnit } from "../module.api";
import { ORG_UNIT_FORM_INITIAL } from "./orgUnitForm.initial";
import {
  contactSchema,
  identitySchema,
  locationSchema,
  ORG_UNIT_STEP_FIELDS,
  settingsSchema,
} from "./orgUnitForm.schemas";
import { StepContact } from "./steps/StepContact";
import { StepIdentity } from "./steps/StepIdentity";
import { StepLocation } from "./steps/StepLocation";
import { StepSettings } from "./steps/StepSettings";
import type { OrgUnitFormValues } from "./orgUnitForm.types";

const STEPS = [
  { label: "Identity", description: "Name, code & unit type" },
  { label: "Location", description: "Province, district & address" },
  { label: "Contact & Head", description: "Contact details & office head" },
  { label: "Settings", description: "Hierarchy, visibility & status" },
];

const STEP_COMPONENTS = [
  <StepIdentity key="identity" />,
  <StepLocation key="location" />,
  <StepContact key="contact" />,
  <StepSettings key="settings" />,
];

interface OrgUnitFormBodyProps {
  onBack: () => void;
  isEdit: boolean;
}

function OrgUnitFormBody({ onBack, isEdit }: OrgUnitFormBodyProps) {
  const { current, handleStepNext, handleStepBack } = useFormControls();

  return (
    <FormShell
      title={isEdit ? "Edit Office Unit" : "New Office Unit"}
      description={
        isEdit
          ? "Update the details for this office unit"
          : "Register a new office unit in the hierarchy"
      }
      onBack={onBack}
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Organizations", href: "/admin/organization" },
        { label: isEdit ? "Edit" : "New", href: "#" },
      ]}
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

export interface OrgUnitFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  initialValues?: OrganizationUnit;
}

export function OrgUnitForm({ onBack, onSuccess, initialValues }: OrgUnitFormProps) {
  const isEdit = !!initialValues?.id;

  const initial: OrgUnitFormValues = initialValues
    ? {
        name: initialValues.name,
        nameNepali: initialValues.nameNepali,
        code: initialValues.code,
        unitType: initialValues.unitType,
        description: initialValues.description,
        province: initialValues.province,
        district: initialValues.district,
        municipality: initialValues.municipality,
        ward: initialValues.ward,
        address: initialValues.address,
        phone: initialValues.phone,
        email: initialValues.email,
        fax: initialValues.fax,
        website: initialValues.website,
        headName: initialValues.headName,
        headTitle: initialValues.headTitle,
        headPhone: initialValues.headPhone,
        headEmail: initialValues.headEmail,
        parentId: initialValues.parentId ?? "",
        taskVisibility: initialValues.taskVisibility,
        confidentialityLevel: initialValues.confidentialityLevel,
        status: initialValues.status,
      }
    : ORG_UNIT_FORM_INITIAL;

  return (
    <FormWrapper<OrgUnitFormValues>
      initial={initial}
      finalSubmitFn={async (data, _stepIds) => {
        const payload = data as Partial<import("../module.api").OrganizationUnit>;
        if (isEdit && initialValues?.id) {
          await updateOrgUnit(initialValues.id, payload);
        } else {
          await createOrgUnit(payload);
        }
        onSuccess?.();
        return { ok: true };
      }}
      validation={[identitySchema, locationSchema, contactSchema, settingsSchema]}
      stepFields={ORG_UNIT_STEP_FIELDS}
      formClearOnSuccess
      hasDirtCheck
    >
      <OrgUnitFormBody onBack={onBack} isEdit={isEdit} />
    </FormWrapper>
  );
}
