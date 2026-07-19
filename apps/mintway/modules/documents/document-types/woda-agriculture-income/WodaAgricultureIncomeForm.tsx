"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  documentSection,
  honorificField,
  nameField,
  RELATIONS,
  spokespersonSection,
} from "../../utils/wodaCommonSections";

const schema: WodaFormSchema = {
  sections: [
    documentSection(),
    {
      title: "Landowner",
      fields: [
        honorificField("landowner_honorific", "Honorific"),
        nameField("landowner_name", "Landowner name", { required: true }),
        {
          name: "landowner_relationship",
          label: "Relationship to applicant",
          control: "combobox",
          options: RELATIONS,
        },
      ],
    },
    {
      title: "Land",
      fields: [
        { name: "land_plot_numbers", label: "Plot numbers", half: true },
        { name: "land_location", label: "Location", half: true },
      ],
    },
    {
      title: "Income",
      fields: [
        {
          name: "crops",
          label: "Crops grown",
          control: "textarea",
        },
        {
          name: "annual_income_nrs",
          label: "Annual income",
          control: "number",
          prefix: "Rs. ",
          thousandSeparator: true,
        },
        {
          name: "annual_income_words",
          label: "Annual income in words",
          optional: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaAgricultureIncomeForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
