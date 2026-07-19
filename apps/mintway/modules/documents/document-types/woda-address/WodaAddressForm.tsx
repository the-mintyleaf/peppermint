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
      title: "Address change",
      fields: [
        {
          name: "initial_address_name",
          label: "Previous address",
          description: "Address recorded before the change",
        },
        {
          name: "address_name_change_date_bs",
          label: "Change date (B.S.)",
          control: "date-bs",
          half: true,
        },
        {
          name: "address_name_change_date",
          label: "Change date (A.D.)",
          control: "date-ad",
          half: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaAddressForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
