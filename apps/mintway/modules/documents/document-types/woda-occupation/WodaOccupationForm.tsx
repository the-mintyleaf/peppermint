"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  applicantSection,
  documentSection,
  earningGuardianField,
  parentsSection,
  spokespersonSection,
} from "../../utils/wodaCommonSections";

const schema: WodaFormSchema = {
  sections: [
    documentSection(),
    applicantSection({ address: true }),
    parentsSection(),
    {
      title: "Occupations",
      fields: [
        earningGuardianField(),
        {
          name: "occupations",
          label: "Occupations",
          control: "occupations",
          occupationColumns: [
            { key: "name", label: "Occupation", type: "text" },
          ],
        },
        {
          name: "occupation_note",
          label: "Additional note",
          control: "textarea",
          optional: true,
        },
        {
          name: "pan_status",
          label: "Earning guardian is registered on PAN",
          control: "switch",
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaOccupationForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
