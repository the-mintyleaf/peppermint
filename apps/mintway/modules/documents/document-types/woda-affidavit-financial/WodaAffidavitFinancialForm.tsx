"use client";

import { WodaForm } from "../../components/WodaForm";
import type { DocumentFormProps } from "../../documents.types";
import type { WodaFormSchema } from "../../utils/wodaFormSchema";
import {
  documentSection,
  HONORIFICS,
  RELATIONS,
} from "../../utils/wodaCommonSections";

const COURSE_LEVELS = ["Bachelor", "Master", "PhD", "Diploma", "PCL"];

const KINSHIP_OPTIONS = [
  { label: "Son", value: "son" },
  { label: "Daughter", value: "daughter" },
];

const PRONOUN_OPTIONS = [
  { label: "Him", value: "him" },
  { label: "Her", value: "her" },
];

const schema: WodaFormSchema = {
  submitLabel: "Create Document",
  sections: [
    documentSection({ dateBs: true, dispatchNo: true }),
    {
      title: "Sponsor",
      fields: [
        {
          name: "sponsor_honorific",
          label: "Honorific",
          control: "combobox",
          options: HONORIFICS,
          defaultValue: "Mr.",
          half: true,
        },
        {
          name: "sponsor_name",
          label: "Sponsor name",
          half: true,
          required: true,
          placeholder: "Ram Bahadur Shrestha",
        },
        {
          name: "sponsor_relation",
          label: "Relation to student",
          control: "combobox",
          options: RELATIONS,
          defaultValue: "Grandfather",
          half: true,
        },
        {
          name: "sponsor_citizenship_no",
          label: "Citizenship no.",
          placeholder: "12345/678",
          half: true,
        },
      ],
    },
    {
      title: "Parents",
      fields: [
        {
          name: "father_honorific",
          label: "Father honorific",
          control: "combobox",
          options: HONORIFICS,
          defaultValue: "Mr.",
          half: true,
        },
        {
          name: "father_name",
          label: "Father name",
          half: true,
          placeholder: "Hari Bahadur Shrestha",
        },
        {
          name: "mother_honorific",
          label: "Mother honorific",
          control: "combobox",
          options: HONORIFICS,
          defaultValue: "Mrs.",
          half: true,
        },
        {
          name: "mother_name",
          label: "Mother name",
          half: true,
          placeholder: "Sita Devi Shrestha",
        },
        {
          name: "parent_citizenship_no",
          label: "Parent citizenship no.",
          placeholder: "12345/678",
          half: true,
        },
        {
          name: "permanent_address",
          label: "Permanent address",
          control: "textarea",
          placeholder: "Birendranagar-5, Surkhet",
        },
      ],
    },
    {
      title: "Student",
      fields: [
        {
          name: "student_honorific",
          label: "Honorific",
          control: "combobox",
          options: HONORIFICS,
          defaultValue: "Miss",
          half: true,
        },
        {
          name: "student_name",
          label: "Student name",
          half: true,
          required: true,
          placeholder: "Gita Kumari Shrestha",
        },
        {
          name: "student_kinship",
          label: "Student is the family's",
          control: "segmented",
          options: KINSHIP_OPTIONS,
          defaultValue: "daughter",
          description: "Referred to as son/daughter in the affidavit.",
        },
        {
          name: "student_pronoun",
          label: "Pronoun",
          control: "segmented",
          options: PRONOUN_OPTIONS,
          defaultValue: "her",
          description: "Sets his/her wording in the text.",
        },
        {
          name: "student_citizenship_no",
          label: "Citizenship no.",
          placeholder: "12345/678",
          half: true,
        },
        {
          name: "student_nid_no",
          label: "National ID no.",
          placeholder: "123-456-7890",
          half: true,
        },
        {
          name: "student_passport_no",
          label: "Passport no.",
          placeholder: "PA1234567",
          half: true,
          optional: true,
        },
      ],
    },
    {
      title: "Course",
      fields: [
        {
          name: "course_level",
          label: "Level",
          control: "combobox",
          options: COURSE_LEVELS,
          defaultValue: "Bachelor",
          half: true,
        },
        {
          name: "course_name",
          label: "Course name",
          placeholder: "BSc Computer Science",
          half: true,
        },
        {
          name: "institution_name",
          label: "Institution",
          placeholder: "University of Example",
          half: true,
        },
        {
          name: "institution_location",
          label: "Institution location",
          placeholder: "Sydney, Australia",
          half: true,
        },
      ],
    },
    {
      title: "Support",
      fields: [
        {
          name: "support_providers",
          label: "Support providers",
          control: "textarea",
          description:
            "Who jointly funds the studies, as it should read in the sentence.",
          placeholder: "the grandmother, father and mother",
        },
      ],
    },
    {
      title: "Signatories",
      description: "Family members who sign the affidavit.",
      fields: [
        {
          name: "signer1_name",
          label: "Signatory 1 name",
          placeholder: "Gita Devi Shrestha",
          half: true,
        },
        {
          name: "signer1_relation",
          label: "Relation",
          control: "combobox",
          options: RELATIONS,
          defaultValue: "Grandmother",
          half: true,
        },
        {
          name: "signer2_name",
          label: "Signatory 2 name",
          placeholder: "Hari Bahadur Shrestha",
          half: true,
        },
        {
          name: "signer2_relation",
          label: "Relation",
          control: "combobox",
          options: RELATIONS,
          defaultValue: "Father",
          half: true,
        },
        {
          name: "signer3_name",
          label: "Signatory 3 name",
          placeholder: "Sita Devi Shrestha",
          half: true,
        },
        {
          name: "signer3_relation",
          label: "Relation",
          control: "combobox",
          options: RELATIONS,
          defaultValue: "Mother",
          half: true,
        },
      ],
    },
    {
      title: "Ward chairman",
      description: "The ward chairman who endorses the affidavit.",
      fields: [
        {
          name: "chairman_name",
          label: "Chairman name",
          placeholder: "Krishna Prasad Adhikari",
          half: true,
        },
        {
          name: "chairman_date",
          label: "Endorsement date (A.D.)",
          control: "date-ad",
          half: true,
        },
      ],
    },
  ],
};

export function WodaAffidavitFinancialForm(props: DocumentFormProps) {
  return <WodaForm schema={schema} {...props} />;
}
