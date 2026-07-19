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
      title: "Fiscal years",
      fields: [
        earningGuardianField(),
        { name: "fiscal_1_bs", label: "Year 1 (B.S.)", half: true },
        { name: "fiscal_1_ad", label: "Year 1 (A.D.)", half: true },
        { name: "fiscal_2_bs", label: "Year 2 (B.S.)", half: true },
        { name: "fiscal_2_ad", label: "Year 2 (A.D.)", half: true },
        { name: "fiscal_3_bs", label: "Year 3 (B.S.)", half: true },
        { name: "fiscal_3_ad", label: "Year 3 (A.D.)", half: true },
      ],
    },
    {
      title: "Income sources",
      fields: [
        {
          name: "occupations",
          label: "Income sources",
          control: "occupations",
          description: "Income earned per fiscal year, by source",
          occupationColumns: [
            { key: "name", label: "Source", type: "text", width: 150 },
            { key: "income1", label: "Year 1", type: "number" },
            { key: "income2", label: "Year 2", type: "number" },
            { key: "income3", label: "Year 3", type: "number" },
          ],
        },
        {
          name: "usd_rate",
          label: "USD rate (NPR per 1 US$)",
          control: "number",
          decimalScale: 2,
          half: true,
        },
        {
          name: "rate_date",
          label: "Rate date (A.D.)",
          control: "date-ad",
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
