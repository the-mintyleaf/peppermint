"use client";

import { createContext, useContext, type ReactNode } from "react";

export type TemplateFormValues = Record<string, unknown>;

interface TemplateFormContextValue {
  values: TemplateFormValues;
}

const TemplateFormContext = createContext<TemplateFormContextValue | null>(null);

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

function useForm() {
  const ctx = useContext(TemplateFormContext);
  if (!ctx) {
    return { values: {} as TemplateFormValues };
  }
  return { values: ctx.values };
}

export const FormHandler = {
  Provider,
  useForm,
};
