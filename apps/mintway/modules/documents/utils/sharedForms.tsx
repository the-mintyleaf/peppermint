"use client";

import type { DocumentFormProps } from "../documents.types";
import { BankStatementForm } from "../components/BankStatementForm";
import { BankCertificateForm } from "../components/BankCertificateForm";
import { WodaForm } from "../components/WodaForm";
import { buildLorSchema, buildMoiSchema } from "./letterFormSchema";

/** Statement forms use the dedicated BankStatementForm (transactions editor + auto totals). */
export const createBankStatementForm = () => BankStatementForm;

/** Certificate forms use the dedicated BankCertificateForm (balance + auto words). */
export const createBankCertificateForm = () => BankCertificateForm;

/** LOR variants: institution constants become schema defaults; rendered by WodaForm. */
export function createLorForm(constants: Record<string, unknown> = {}) {
  const schema = buildLorSchema(constants);
  return function LorVariantForm(props: DocumentFormProps) {
    return <WodaForm schema={schema} {...props} />;
  };
}

/** MOI variants: institution constants become schema defaults; rendered by WodaForm. */
export function createMoiForm(constants: Record<string, unknown> = {}) {
  const schema = buildMoiSchema(constants);
  return function MoiVariantForm(props: DocumentFormProps) {
    return <WodaForm schema={schema} {...props} />;
  };
}
