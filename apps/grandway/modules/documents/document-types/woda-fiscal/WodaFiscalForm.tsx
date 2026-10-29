"use client";

import { createSchemaForm } from "../../components/WodaForm";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  earningGuardianField,
  parentsSection,
  spokespersonSection,
} from "../../utils/wodaCommonSections";

const schema: WodaFormSchema = {
  sections: [
    parentsSection(),
    {
      title: "Income statements",
      description:
        "Each line is printed as a numbered point describing that year's income.",
      fields: [
        earningGuardianField(),
        {
          name: "fiscal_fullfiscal_1",
          label: "Income statement 1",
          control: "textarea",
          placeholder:
            "In F.Y. 2079/080, earned Rs. 5,00,000 from vegetable farming.",
        },
        {
          name: "fiscal_fullfiscal_2",
          label: "Income statement 2",
          control: "textarea",
          placeholder:
            "In F.Y. 2080/081, earned Rs. 6,00,000 from vegetable farming.",
        },
        {
          name: "fiscal_fullfiscal_3",
          label: "Income statement 3",
          control: "textarea",
          placeholder:
            "In F.Y. 2081/082, earned Rs. 7,00,000 from vegetable farming.",
        },
      ],
    },
    spokespersonSection(),
  ],
};

export const WodaFiscalForm = createSchemaForm(schema, {
  displayName: "WodaFiscalForm",
});
