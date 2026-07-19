"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  applicantSection,
  documentSection,
  honorificField,
  nameField,
  parentsSection,
  RELATIONS,
  spokespersonSection,
} from "../../utils/wodaCommonSections";

const schema: WodaFormSchema = {
  sections: [
    documentSection(),
    applicantSection({ address: true }),
    parentsSection(),
    {
      title: "Relationship",
      fields: [
        {
          name: "extra_relation",
          label: "Relationship being certified",
          control: "combobox",
          options: RELATIONS,
        },
        {
          name: "signature_issued_act_relationship",
          label: "Issuing act / reference",
        },
        honorificField("relation_extra_honorific", "Related person honorific"),
        nameField("relation_extra_name", "Related person name"),
        {
          name: "relation_extra_relation",
          label: "Relation to applicant",
          control: "combobox",
          options: RELATIONS,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaRelationshipForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
