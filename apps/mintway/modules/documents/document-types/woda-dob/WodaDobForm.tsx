"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  applicantSection,
  documentSection,
  parentsSection,
  spokespersonSection,
} from "../../utils/wodaCommonSections";

const schema: WodaFormSchema = {
  sections: [
    documentSection(),
    applicantSection({ gender: true, address: true }),
    parentsSection(),
    {
      title: "Birth & citizenship",
      fields: [
        {
          name: "applicant_dob_bs",
          label: "Date of birth (B.S.)",
          control: "date-bs",
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
          control: "textarea",
        },
        {
          name: "applicant_citizenship",
          label: "Citizenship no.",
          half: true,
        },
        {
          name: "applicant_citizenship_issuer",
          label: "Issuing office",
          half: true,
        },
        {
          name: "signature_issued_act_dob",
          label: "Issuing act / reference",
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaDobForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
