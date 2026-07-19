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
          placeholder: "Birendranagar-5, Surkhet",
        },
        {
          name: "applicant_citizenship",
          label: "Citizenship certificate no.",
          placeholder: "12345/678",
          half: true,
        },
        {
          name: "applicant_citizenship_issuer",
          label: "Citizenship issued by",
          description: "Office that issued the citizenship certificate.",
          placeholder: "DAO, Surkhet",
          half: true,
        },
        {
          name: "signature_issued_act_dob",
          label: "Legal basis for issuance",
          description: "The act or record the certificate cites as its basis.",
          placeholder: "Local Government Operation Act, 2074",
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaDobForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
