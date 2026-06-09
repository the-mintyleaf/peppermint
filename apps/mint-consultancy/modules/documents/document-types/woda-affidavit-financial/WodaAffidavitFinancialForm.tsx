"use client";

import { Stack, TextInput, Button, Select } from "@zetsel/ui";
import { useForm } from "@zetsel/ui";
import type { DocumentFormProps } from "../../documents.types";

export function WodaAffidavitFinancialForm({ onSubmit, isLoading }: DocumentFormProps) {
  const form = useForm({
    initialValues: {
      wodadoc_refno: "",
      dispatch_no: "",
      wodadoc_date_bs: "",
      wodadoc_date: new Date().toISOString().split("T")[0],
      // Sponsor
      sponsor_honorific: "Mr.",
      sponsor_name: "",
      sponsor_relation: "Grandfather",
      sponsor_citizenship_no: "",
      // Parents
      father_honorific: "Mr.",
      father_name: "",
      mother_honorific: "Mrs.",
      mother_name: "",
      parent_citizenship_no: "",
      permanent_address: "",
      // Student
      student_honorific: "Miss",
      student_name: "",
      student_pronoun: "her",
      student_kinship: "daughter",
      student_citizenship_no: "",
      student_nid_no: "",
      student_passport_no: "",
      course_level: "Bachelor",
      course_name: "",
      institution_name: "",
      institution_location: "",
      // Support
      support_providers: "",
      // Signatories
      signer1_name: "",
      signer1_relation: "Grandmother",
      signer2_name: "",
      signer2_relation: "Father",
      signer3_name: "",
      signer3_relation: "Mother",
      // Ward chairman
      chairman_name: "",
      chairman_date: "",
    },
    onSubmit: (values) => onSubmit(values as never),
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Stack gap="md" p="md">
        <TextInput label="Ref. No." {...form.getInputProps("wodadoc_refno")} disabled={isLoading} />
        <TextInput label="Dispatch No." {...form.getInputProps("dispatch_no")} disabled={isLoading} />
        <TextInput label="Date (BS)" {...form.getInputProps("wodadoc_date_bs")} disabled={isLoading} />
        <TextInput label="Date (AD)" type="date" {...form.getInputProps("wodadoc_date")} disabled={isLoading} />

        <TextInput label="Sponsor Honorific" {...form.getInputProps("sponsor_honorific")} disabled={isLoading} />
        <TextInput label="Sponsor Name" {...form.getInputProps("sponsor_name")} required disabled={isLoading} />
        <TextInput label="Sponsor Relation" {...form.getInputProps("sponsor_relation")} disabled={isLoading} />
        <TextInput label="Sponsor Citizenship No." {...form.getInputProps("sponsor_citizenship_no")} disabled={isLoading} />

        <TextInput label="Father Honorific" {...form.getInputProps("father_honorific")} disabled={isLoading} />
        <TextInput label="Father Name" {...form.getInputProps("father_name")} disabled={isLoading} />
        <TextInput label="Mother Honorific" {...form.getInputProps("mother_honorific")} disabled={isLoading} />
        <TextInput label="Mother Name" {...form.getInputProps("mother_name")} disabled={isLoading} />
        <TextInput label="Parent Citizenship No." {...form.getInputProps("parent_citizenship_no")} disabled={isLoading} />
        <TextInput label="Permanent Address" {...form.getInputProps("permanent_address")} disabled={isLoading} />

        <TextInput label="Student Honorific" {...form.getInputProps("student_honorific")} disabled={isLoading} />
        <TextInput label="Student Name" {...form.getInputProps("student_name")} required disabled={isLoading} />
        <Select
          label="Student Pronoun"
          data={[{ value: "him", label: "Him (Son)" }, { value: "her", label: "Her (Daughter)" }]}
          {...form.getInputProps("student_pronoun")}
          disabled={isLoading}
        />
        <TextInput label="Student Citizenship No." {...form.getInputProps("student_citizenship_no")} disabled={isLoading} />
        <TextInput label="Student NID No." {...form.getInputProps("student_nid_no")} disabled={isLoading} />
        <TextInput label="Student Passport No." {...form.getInputProps("student_passport_no")} disabled={isLoading} />

        <TextInput label="Course Level (e.g. Bachelor)" {...form.getInputProps("course_level")} disabled={isLoading} />
        <TextInput label="Course Name" {...form.getInputProps("course_name")} disabled={isLoading} />
        <TextInput label="Institution Name" {...form.getInputProps("institution_name")} disabled={isLoading} />
        <TextInput label="Institution Location" {...form.getInputProps("institution_location")} disabled={isLoading} />

        <TextInput label="Support Providers (point 2 text)" {...form.getInputProps("support_providers")} disabled={isLoading} />

        <TextInput label="Signer 1 Name" {...form.getInputProps("signer1_name")} disabled={isLoading} />
        <TextInput label="Signer 1 Relation" {...form.getInputProps("signer1_relation")} disabled={isLoading} />
        <TextInput label="Signer 2 Name" {...form.getInputProps("signer2_name")} disabled={isLoading} />
        <TextInput label="Signer 2 Relation" {...form.getInputProps("signer2_relation")} disabled={isLoading} />
        <TextInput label="Signer 3 Name" {...form.getInputProps("signer3_name")} disabled={isLoading} />
        <TextInput label="Signer 3 Relation" {...form.getInputProps("signer3_relation")} disabled={isLoading} />

        <TextInput label="Ward Chairman Name" {...form.getInputProps("chairman_name")} disabled={isLoading} />
        <TextInput label="Ward Chairman Date" {...form.getInputProps("chairman_date")} disabled={isLoading} />

        <Button type="submit" loading={isLoading} fullWidth>
          Create Document
        </Button>
      </Stack>
    </form>
  );
}
