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
      fields: [
        {
          name: "initial_address",
          label: "Previous address",
          description: "Address before migration",
        },
        {
          name: "migration_date",
          label: "Migration date (A.D.)",
          control: "date-ad",
        },
        {
          name: "signature_migration_alongwith",
          label: "Migrated along with",
          description: "Family members who migrated together",
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
