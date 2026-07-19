"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  documentSection,
  earningGuardianField,
  parentsSection,
  spokespersonSection,
} from "../../utils/wodaCommonSections";

const schema: WodaFormSchema = {
  sections: [
    documentSection(),
    parentsSection(),
    {
      title: "Fiscal income",
      fields: [
        earningGuardianField(),
        {
          name: "fiscal_fullfiscal_1",
          label: "Fiscal year 1",
          placeholder: "2079/080",
          half: true,
        },
        {
          name: "fiscal_fullfiscal_2",
          label: "Fiscal year 2",
          placeholder: "2080/081",
          half: true,
        },
        {
          name: "fiscal_fullfiscal_3",
          label: "Fiscal year 3",
          placeholder: "2081/082",
          half: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaFiscalForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
