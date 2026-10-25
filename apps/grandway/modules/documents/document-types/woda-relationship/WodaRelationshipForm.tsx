"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  applicantSection,
  documentSection,
  grandparentsSection,
  identityNumbersSection,
  legalBasisField,
  parentsSection,
  relativesField,
  spokespersonSection,
} from "../../utils/wodaCommonSections";
import { WODA_LEGAL_BASIS } from "../../utils/wodaDefaults";

/** The relationship letter's fields; the two sets differ only in legal basis. */
export function relationshipSchema(legalBasis: string): WodaFormSchema {
  return {
    sections: [
      documentSection(),
      applicantSection({ gender: true, address: true }),
      identityNumbersSection(),
      parentsSection({ citizenship: true }),
      grandparentsSection(),
      {
        title: "Relationship table",
        description:
          "The applicant and each living parent are listed automatically.",
        fields: [
          relativesField(),
          legalBasisField("signature_issued_act_relationship", legalBasis),
        ],
      },
      spokespersonSection(),
    ],
  };
}

const schema = relationshipSchema(WODA_LEGAL_BASIS.japanRelationship);

export function WodaRelationshipForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
