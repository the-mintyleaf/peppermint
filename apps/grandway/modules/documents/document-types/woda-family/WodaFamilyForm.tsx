"use client";

import { createSchemaForm } from "../../components/WodaForm";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  applicantSection,
  grandparentsSection,
  identityNumbersSection,
  parentsSection,
  spokespersonSection,
} from "../../utils/wodaCommonSections";

const schema: WodaFormSchema = {
  sections: [
    applicantSection({ gender: true, address: true }),
    identityNumbersSection(),
    parentsSection(),
    grandparentsSection(),
    {
      title: "Family",
      description:
        "Leave a paragraph blank to print the standard nuclear-family wording.",
      fields: [
        {
          name: "family_statement",
          label: "Family statement",
          control: "textarea",
          placeholder:
            "This Ward Office certifies that the applicant has a nuclear family of three people. They are the applicant, his father and mother. …",
          optional: true,
        },
        {
          name: "family_note",
          label: "Closing note",
          control: "textarea",
          placeholder:
            "Therefore, the names and photos of the applicant's grandparents were not included in …",
          optional: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export const WodaFamilyForm = createSchemaForm(schema, {
  displayName: "WodaFamilyForm",
});
