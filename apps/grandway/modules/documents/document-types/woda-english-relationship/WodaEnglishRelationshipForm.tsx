"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import { WODA_LEGAL_BASIS } from "../../utils/wodaDefaults";
import { relationshipSchema } from "../woda-relationship/WodaRelationshipForm";

const schema = relationshipSchema(WODA_LEGAL_BASIS.english);

export function WodaEnglishRelationshipForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
