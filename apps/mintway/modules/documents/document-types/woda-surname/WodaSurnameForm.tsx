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
      title: "Surname details",
      fields: [
        {
          name: "applicant_surname_reference",
          label: "Surname reference",
          description: "Document or basis the surname is drawn from",
        },
        { name: "applicant_surname", label: "Applicant surname", half: true },
        {
          name: "applicant_parents_surname",
          label: "Parents' surname",
          half: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaSurnameForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
