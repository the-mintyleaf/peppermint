"use client";

import { createSchemaForm } from "../../components/WodaForm";
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
      title: "Surname discrepancy",
      description:
        "The certificate states these surnames belong to the same family.",
      fields: [
        {
          name: "applicant_surname_reference",
          label: "Surname source",
          description:
            "Where the differing surname appears, as it reads in the sentence.",
          placeholder: "the surname on the citizenship certificate",
        },
        {
          name: "applicant_surname",
          label: "Applicant's surname",
          placeholder: "Shrestha",
          half: true,
        },
        {
          name: "applicant_parents_surname",
          label: "Parents' surname",
          placeholder: "Pradhan",
          half: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export const WodaSurnameForm = createSchemaForm(schema, {
  displayName: "WodaSurnameForm",
});
