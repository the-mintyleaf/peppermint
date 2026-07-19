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
      description: "The three Nepali fiscal years the clearance covers.",
      fields: [
        earningGuardianField(),
        {
          name: "fiscal_1_bs",
          label: "Year 1 (B.S.)",
          placeholder: "2079/080",
          half: true,
        },
        {
          name: "fiscal_1_ad",
          label: "Year 1 (A.D.)",
          placeholder: "2022/023",
          half: true,
        },
        {
          name: "fiscal_2_bs",
          label: "Year 2 (B.S.)",
          placeholder: "2080/081",
          half: true,
        },
        {
          name: "fiscal_2_ad",
          label: "Year 2 (A.D.)",
          placeholder: "2023/024",
          half: true,
        },
        {
          name: "fiscal_3_bs",
          label: "Year 3 (B.S.)",
          placeholder: "2081/082",
          half: true,
        },
        {
          name: "fiscal_3_ad",
          label: "Year 3 (A.D.)",
          placeholder: "2024/025",
          half: true,
        },
      ],
    },
    {
      title: "Tax clearance",
      fields: [
        {
          name: "occupations",
          label: "Income sources",
          control: "occupations",
          description:
            "One row per source; enter the amount earned in each of the three years.",
          occupationColumns: [
            { key: "name", label: "Source", type: "text", width: 150 },
            { key: "income1", label: "Year 1 (Rs.)", type: "number" },
            { key: "income2", label: "Year 2 (Rs.)", type: "number" },
            { key: "income3", label: "Year 3 (Rs.)", type: "number" },
          ],
        },
        {
          name: "tax",
          label: "Tax rate (%)",
          control: "number",
          min: 0,
          max: 100,
          decimalScale: 2,
          suffix: "%",
          description: "Set to 0 to mark the income as tax-exempt.",
          placeholder: "1",
          half: true,
        },
        {
          name: "tax_clearance_issuer",
          label: "Issuing tax office",
          description: "Office readers are directed to for queries.",
          placeholder: "Inland Revenue Office, Surkhet",
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
