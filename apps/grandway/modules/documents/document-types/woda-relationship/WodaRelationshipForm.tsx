"use client";

import { createSchemaForm } from "../../components/WodaForm";
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

/**
 * Before the repeatable `relatives` list, a letter held at most one extra
 * relative behind the `extra_relation` switch. Move it into the list, or the
 * first re-save would write an empty list and drop that relative.
 */
function migrateExtraRelative(
  values: Record<string, unknown>,
): Record<string, unknown> {
  if (Array.isArray(values.relatives) || !values.extra_relation) {
    return values;
  }
  const name = [values.relation_extra_honorific, values.relation_extra_name]
    .filter((part) => typeof part === "string" && part.trim() !== "")
    .join(" ");
  return {
    ...values,
    extra_relation: false,
    relatives: [
      {
        name,
        citizenship: "",
        relation: values.relation_extra_relation ?? "",
      },
    ],
  };
}

/** The relationship letter's fields; the two sets differ only in legal basis. */
export function relationshipSchema(legalBasis: string): WodaFormSchema {
  return {
    migrate: migrateExtraRelative,
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

export const WodaRelationshipForm = createSchemaForm(schema, {
  displayName: "WodaRelationshipForm",
});
