"use client";

import { useFormControls, FormShell, FormWrapper } from "@zetsel/admin";
import { PRODUCT_FORM_INITIAL } from "./productForm.initial";
import {
  identityMediaSchema,
  pricingSchema,
  ratingsSchema,
  specificationsSchema,
  PRODUCT_STEP_FIELDS,
} from "./productForm.schemas";
import { StepIdentityMedia } from "./steps/StepIdentityMedia";
import { StepPricing } from "./steps/StepPricing";
import { StepRatings } from "./steps/StepRatings";
import { StepSpecifications } from "./steps/StepSpecifications";
import type { ProductFormValues } from "./productForm.types";

const STEPS = [
  { label: "Identity & Media", description: "Slug, brand, names, images & colors" },
  { label: "Pricing", description: "Price, MRP & availability" },
  { label: "Ratings", description: "Scores & audience" },
  { label: "Specifications", description: "Highlights & full specs" },
];

const STEP_COMPONENTS = [
  <StepIdentityMedia key="identity-media" />,
  <StepPricing key="pricing" />,
  <StepRatings key="ratings" />,
  <StepSpecifications key="specs" />,
];

function ProductFormBody({ onBack }: { onBack: () => void }) {
  const { current, handleStepNext, handleStepBack } = useFormControls();

  return (
    <FormShell
      title="New Product"
      description="Fill all steps to publish the product"
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

interface ProductFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function ProductForm({ onBack, onSuccess }: ProductFormProps) {
  return (
    <FormWrapper<ProductFormValues>
      initial={PRODUCT_FORM_INITIAL}
      finalSubmitFn={async (data) => {
        // TODO: replace with real API call via @zetsel/api-client
        console.log("[product] submit", data);
        onSuccess?.();
        return { ok: true };
      }}
      validation={[
        identityMediaSchema,
        pricingSchema,
        ratingsSchema,
        specificationsSchema,
      ]}
      stepFields={PRODUCT_STEP_FIELDS}
      formClearOnSuccess
      hasDirtCheck
    >
      <ProductFormBody onBack={onBack} />
    </FormWrapper>
  );
}
