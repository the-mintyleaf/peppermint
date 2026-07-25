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
      description: "The person who owns the farmland.",
      fields: [
        honorificField("landowner_honorific", "Honorific", "Mr."),
        nameField("landowner_name", "Landowner name", {
          required: true,
          placeholder: "Ram Bahadur Shrestha",
        }),
        {
          name: "landowner_relationship",
          label: "Relationship to applicant",
          control: "combobox",
          options: RELATIONS,
          placeholder: "Father",
        },
      ],
    },
    {
      title: "Land",
      fields: [
        {
          name: "land_plot_numbers",
          label: "Plot (kitta) numbers",
          placeholder: "123, 124, 125",
          half: true,
        },
        {
          name: "land_location",
          label: "Land location",
          placeholder: "Birendranagar-5, Surkhet",
          half: true,
        },
      ],
    },
    {
      title: "Income",
      fields: [
        {
          name: "crops",
          label: "Crops grown",
          control: "textarea",
          placeholder: "Paddy, wheat, maize, vegetables",
        },
        {
          name: "annual_income_nrs",
          label: "Annual income",
          control: "number",
          prefix: "Rs. ",
          thousandSeparator: true,
          placeholder: "500000",
        },
        {
          name: "annual_income_words",
          label: "Annual income in words",
          description: "The amount written out, as it should print.",
          placeholder: "Five hundred thousand rupees only",
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
