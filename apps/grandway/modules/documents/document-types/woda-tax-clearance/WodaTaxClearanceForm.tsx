"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  applicantSection,
  documentSection,
  fiscalYearsSection,
  incomeSourcesField,
  parentsSection,
  spokespersonSection,
} from "../../utils/wodaCommonSections";

const schema: WodaFormSchema = {
  sections: [
    documentSection(),
    applicantSection({ address: true }),
    parentsSection(),
    fiscalYearsSection("The three Nepali fiscal years the clearance covers."),
    {
      title: "Tax clearance",
      fields: [
        incomeSourcesField(),
        {
          name: "tax",
          label: "Tax rate (%)",
          control: "number",
          min: 0,
          max: 100,
          decimalScale: 2,
          suffix: "%",
          description: "0 for agricultural income, which is tax-exempt.",
          placeholder: "0",
          half: true,
        },
        {
          name: "tax_clearance_issuer",
          label: "Contact office",
          description: 'Printed as "contact us at Office of …".',
          placeholder: "Rapti Sonari Rural Municipality",
          half: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaTaxClearanceForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
