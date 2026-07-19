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
      title: "Migration",
      description: "Certifies the applicant migrated to their current address.",
      fields: [
        {
          name: "initial_address",
          label: "Migrated from",
          description: "The address the applicant migrated away from.",
          placeholder: "Birendranagar-3, Surkhet",
        },
        {
          name: "migration_date",
          label: "Migration date (A.D.)",
          control: "date-ad",
        },
        {
          name: "signature_migration_alongwith",
          label: "Accompanying family (phrase)",
          description:
            "Printed after the applicant's name — write it as a phrase.",
          placeholder: "along with his family",
          optional: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaMigrationForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
