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
  spokespersonSection,
} from "../../utils/wodaCommonSections";
import { WODA_LEGAL_BASIS } from "../../utils/wodaDefaults";

/** The birth letter's fields; the Japan and English-country sets differ only in legal basis. */
export function birthVerificationSchema(legalBasis: string): WodaFormSchema {
  return {
    sections: [
      documentSection(),
      applicantSection({ gender: true, address: true }),
      identityNumbersSection(),
      parentsSection(),
      grandparentsSection(),
      {
        title: "Birth",
        fields: [
          {
            name: "applicant_dob_bs",
            label: "Date of birth (B.S.)",
            control: "date-bs",
            placeholder: "2055/05/20",
            half: true,
          },
          {
            name: "applicant_dob",
            label: "Date of birth (A.D.)",
            control: "date-ad",
            half: true,
          },
          {
            name: "applicant_birth_address",
            label: "Place of birth",
            placeholder: "Kalikot, Nepal",
          },
          legalBasisField("signature_issued_act_dob", legalBasis),
        ],
      },
      spokespersonSection(),
    ],
  };
}

const schema = birthVerificationSchema(WODA_LEGAL_BASIS.japanBirth);

export const WodaDobForm = createSchemaForm(schema, {
  displayName: "WodaDobForm",
});
