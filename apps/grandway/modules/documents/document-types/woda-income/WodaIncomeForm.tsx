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
    fiscalYearsSection("The three Nepali fiscal years the income covers."),
    {
      title: "Income & exchange rate",
      fields: [
        incomeSourcesField(),
        {
          name: "usd_rate",
          label: "Exchange rate (NPR per 1 US$)",
          control: "number",
          decimalScale: 2,
          description:
            "Nepal Rastra Bank rate used to convert the totals to USD.",
          placeholder: "153.80",
          half: true,
        },
        {
          name: "rate_date",
          label: "Rate date (A.D.)",
          control: "date-ad",
          description: "Date the NRB rate was quoted.",
          half: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaIncomeForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
