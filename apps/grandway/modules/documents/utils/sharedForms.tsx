"use client";

import type { DocumentContent, DocumentFormProps } from "../documents.types";
import { BankStatementForm } from "../components/BankStatementForm";
import { BankCertificateForm } from "../components/BankCertificateForm";
import { WodaForm } from "../components/WodaForm";
import { buildLorSchema, buildMoiSchema } from "./letterFormSchema";

/** Statement forms use the dedicated BankStatementForm (transactions editor + auto totals). */
export const createBankStatementForm = () => BankStatementForm;

/** Certificate forms use the dedicated BankCertificateForm (balance + auto words). */
export const createBankCertificateForm = () => BankCertificateForm;

/**
 * LOR variants. Institution constants drive two things: which content fields the form
 * exposes (per-variant academic fields opt in via empty-string constants) and the values
 * baked into the saved content. Router/hardcoded keys (institution_name, lor_title, …)
 * are merged in at submit rather than shown, so editing can't misroute or blank a letter.
 * Edited values win over the baked constants.
 */
export function createLorForm(constants: Record<string, unknown> = {}) {
  const schema = buildLorSchema(constants);
  return function LorVariantForm({ onSubmit, ...props }: DocumentFormProps) {
    return (
      <WodaForm
        schema={schema}
        onSubmit={(content) =>
          onSubmit({ ...constants, ...content } as DocumentContent)
        }
        {...props}
      />
    );
  };
}

/** MOI variants: institution constants become schema defaults; rendered by WodaForm. */
export function createMoiForm(constants: Record<string, unknown> = {}) {
  const schema = buildMoiSchema(constants);
  return function MoiVariantForm(props: DocumentFormProps) {
    return <WodaForm schema={schema} {...props} />;
  };
}
