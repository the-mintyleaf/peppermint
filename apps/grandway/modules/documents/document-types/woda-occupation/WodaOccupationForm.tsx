"use client";

import { createSchemaForm } from "../../components/WodaForm";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  applicantSection,
  earningGuardianField,
  parentsSection,
  spokespersonSection,
} from "../../utils/wodaCommonSections";

const schema: WodaFormSchema = {
  sections: [
    applicantSection({ address: true }),
    parentsSection(),
    {
      title: "Occupation",
      fields: [
        earningGuardianField(),
        {
          name: "occupation_title",
          label: "Occupation",
          description: 'Printed as "is a farmer by occupation".',
          placeholder: "farmer",
          defaultValue: "farmer",
          half: true,
          clipboardKey: "guardian.occupation",
        },
        {
          name: "occupation_activity",
          label: "Activity",
          description: 'Printed as "His farming activities are as follows".',
          placeholder: "farming",
          defaultValue: "farming",
          half: true,
        },
        {
          name: "occupations",
          label: "Sources of income",
          control: "occupations",
          description:
            "Leave the owner blank to print the earning guardian's name.",
          emptyText: "No sources yet — add your first row.",
          occupationColumns: [
            {
              key: "name",
              label: "Source of income",
              type: "text",
              placeholder: "Paddy Cultivation",
            },
            {
              key: "owner",
              label: "Owner",
              type: "text",
              placeholder: "Mr. Dharmaraj Upadhyay",
            },
          ],
        },
        {
          name: "pan_status",
          label: "Earning guardian is registered on PAN",
          control: "switch",
          description:
            "When off, the note ends by stating the guardian isn't registered on PAN.",
        },
        {
          name: "occupation_note",
          label: "Note",
          control: "textarea",
          description:
            "Leave blank to print the standard agricultural tax-exemption note.",
          placeholder:
            "According to the Government of Nepal, taxes are exempted for the income from Agriculture. So, it is not necessary to register on PAN.",
          optional: true,
        },
      ],
    },
    spokespersonSection(),
  ],
};

export const WodaOccupationForm = createSchemaForm(schema, {
  displayName: "WodaOccupationForm",
});
