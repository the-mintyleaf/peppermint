"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Read-only form context that feeds document templates their field values.
 *
 * Templates call `FormHandler.useForm()` and read `form.values?.<field>`. The document
 * editor supplies the values through `FormHandler.Provider` (wired by
 * `TemplateRenderProvider`). This is the single canonical instance — the module's
 * `TemplateRenderProvider/formHandler.tsx` re-exports it so the provider and the templates
 * share one context.
 */
export type TemplateFormValues = Record<string, unknown>;

/**
 * Read-side view of the form bag. The copied document templates read, index, `.map()` and do
 * arithmetic on arbitrary fields, so the value view is intentionally untyped — narrowing each
 * field would require editing the templates, which must stay byte-identical to the source.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TemplateFormValuesView = Record<string, any>;

interface TemplateFormContextValue {
  values: TemplateFormValues;
}

const TemplateFormContext = createContext<TemplateFormContextValue | null>(
  null,
);

function Provider({
  values,
  children,
}: {
  values: TemplateFormValues;
  children: ReactNode;
}) {
  return (
    <TemplateFormContext.Provider value={{ values }}>
      {children}
    </TemplateFormContext.Provider>
  );
}

function useForm(): { values: TemplateFormValuesView } {
  const ctx = useContext(TemplateFormContext);
  if (!ctx) {
    return { values: {} };
  }
  return { values: ctx.values as TemplateFormValuesView };
}

export const FormHandler = {
  Provider,
  useForm,
};
