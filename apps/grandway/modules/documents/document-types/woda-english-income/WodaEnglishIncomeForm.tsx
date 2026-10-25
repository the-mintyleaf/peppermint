"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  applicantSection,
  documentSection,
  spokespersonSection,
} from "../../utils/wodaCommonSections";
import { WODA_FOREIGN_CURRENCIES } from "../../utils/wodaDefaults";

const schema: WodaFormSchema = {
  sections: [
    documentSection(),
    applicantSection({ address: true }),
    {
      title: "Income",
      description:
        "Every earner in the family is named in the opening sentence, in the order they first appear here.",
      fields: [
        {
          name: "incomes",
          label: "Income sources",
          control: "occupations",
          required: true,
          emptyText: "No income sources yet — add your first row.",
          occupationColumns: [
            {
              key: "source",
              label: "Source",
              type: "text",
              width: 140,
              placeholder: "Income from Salary",
            },
            {
              key: "detail",
              label: "Detail",
              type: "text",
              width: 140,
              placeholder: "Plot No. 548",
            },
            {
              key: "owner",
              label: "Owner",
              type: "text",
              width: 140,
              placeholder: "Mr. Janga Khadka",
            },
            {
              key: "relation",
              label: "Relation",
              type: "text",
              placeholder: "Father",
            },
            { key: "amount", label: "Annual income (NPR)", type: "number" },
            {
              key: "remarks",
              label: "Remarks",
              type: "text",
              width: 140,
              placeholder: "As per the Salary Certificate",
            },
          ],
        },
      ],
    },
    {
      title: "Fiscal year & exchange rate",
      fields: [
        {
          name: "fiscal_bs",
          label: "Fiscal year (B.S.)",
          placeholder: "2081/82",
          half: true,
        },
        {
          name: "fiscal_ad",
          label: "Fiscal year (A.D.)",
          placeholder: "2024/2025",
          half: true,
        },
        {
          name: "foreign_currency",
          label: "Convert to",
          control: "combobox",
          options: WODA_FOREIGN_CURRENCIES,
          placeholder: "Euro",
          defaultValue: "Euro",
          third: true,
        },
        {
          name: "foreign_rate",
          label: "NPR per 1 unit",
          control: "number",
          decimalScale: 2,
          placeholder: "177.09",
          description: "Nepal Rastra Bank rate.",
          third: true,
        },
        {
          name: "rate_date",
          label: "Rate date (A.D.)",
          control: "date-ad",
          description: "Date the rate was quoted.",
          third: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaEnglishIncomeForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
