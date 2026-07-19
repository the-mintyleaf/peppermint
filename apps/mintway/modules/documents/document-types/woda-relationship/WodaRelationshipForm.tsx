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
      description:
        "Certifies the applicant's family relationships (parents above).",
      fields: [
        {
          name: "signature_issued_act_relationship",
          label: "Legal basis for issuance",
          description: "The act or record the certificate cites as its basis.",
          placeholder: "Local Government Operation Act, 2074",
        },
        {
          name: "extra_relation",
          label: "Include an additional relative",
          control: "switch",
          description:
            "Adds one more related person (below) to the certificate.",
        },
        honorificField("relation_extra_honorific", "Relative honorific"),
        nameField("relation_extra_name", "Relative name", {
          placeholder: "Gita Devi Shrestha",
        }),
        {
          name: "relation_extra_relation",
          label: "Relation to applicant",
          control: "combobox",
          options: RELATIONS,
          placeholder: "Sister",
        },
      ],
    },
    spokespersonSection(),
  ],
};

export function WodaRelationshipForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
