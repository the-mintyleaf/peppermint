"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import { WODA_LEGAL_BASIS } from "../../utils/wodaDefaults";
import { birthVerificationSchema } from "../woda-dob/WodaDobForm";

const schema = birthVerificationSchema(WODA_LEGAL_BASIS.english);

export function WodaEnglishDobForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
