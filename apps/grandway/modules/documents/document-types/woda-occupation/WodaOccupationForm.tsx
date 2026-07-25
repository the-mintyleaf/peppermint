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
          description: "Each occupation is listed as a source of income.",
          occupationColumns: [
            { key: "name", label: "Occupation", type: "text" },
          ],
        },
        {
          name: "occupation_note",
          label: "Closing note",
          control: "textarea",
          description: "Extra sentence printed before the PAN statement.",
          placeholder: "The above income supports the family.",
          optional: true,
        },
        {
          name: "pan_status",
          label: "Earning guardian is registered on PAN",
          control: "switch",
          description:
            "When off, the certificate states the guardian is not registered on PAN.",
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaOccupationForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
