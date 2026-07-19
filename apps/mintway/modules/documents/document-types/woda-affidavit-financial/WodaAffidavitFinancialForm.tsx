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
        { name: "father_name", label: "Father name", half: true },
        {
          name: "mother_honorific",
          label: "Mother honorific",
          control: "combobox",
          options: HONORIFICS,
          defaultValue: "Mrs.",
          half: true,
        },
        { name: "mother_name", label: "Mother name", half: true },
        {
          name: "parent_citizenship_no",
          label: "Parent citizenship no.",
          half: true,
        },
        {
          name: "permanent_address",
          label: "Permanent address",
          control: "textarea",
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
        },
        {
          name: "student_kinship",
          label: "Kinship to sponsor",
          control: "segmented",
          options: KINSHIP_OPTIONS,
          defaultValue: "daughter",
        },
        {
          name: "student_pronoun",
          label: "Pronoun",
          control: "segmented",
          options: PRONOUN_OPTIONS,
          defaultValue: "her",
        },
        {
          name: "student_citizenship_no",
          label: "Citizenship no.",
          half: true,
        },
        { name: "student_nid_no", label: "National ID no.", half: true },
        {
          name: "student_passport_no",
          label: "Passport no.",
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
        { name: "course_name", label: "Course name", half: true },
        { name: "institution_name", label: "Institution", half: true },
        { name: "institution_location", label: "Location", half: true },
      ],
    },
    {
      title: "Support",
      fields: [
        {
          name: "support_providers",
          label: "Support providers",
          control: "textarea",
          description: "Who jointly provides financial support",
        },
      ],
    },
    {
      title: "Signatories",
      fields: [
        { name: "signer1_name", label: "Signatory 1 name", half: true },
        {
          name: "signer1_relation",
          label: "Relation",
          control: "combobox",
          options: RELATIONS,
          defaultValue: "Grandmother",
          half: true,
        },
        { name: "signer2_name", label: "Signatory 2 name", half: true },
        {
          name: "signer2_relation",
          label: "Relation",
          control: "combobox",
          options: RELATIONS,
          defaultValue: "Father",
          half: true,
        },
        { name: "signer3_name", label: "Signatory 3 name", half: true },
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
      fields: [
        { name: "chairman_name", label: "Chairman name", half: true },
        {
          name: "chairman_date",
          label: "Date (A.D.)",
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
