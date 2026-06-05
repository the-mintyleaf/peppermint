"use client";

import { Stack, TextInput, Select, Button } from "@zetsel/ui";
import { useForm } from "@zetsel/ui";
import type { DocumentFormProps, CertificateContent } from "../../documents.types";

export function CertificateForm({
  studentFullData,
  onSubmit,
  isLoading,
}: DocumentFormProps) {
  const form = useForm<CertificateContent>({
    initialValues: {
      issueDate: new Date().toISOString().split("T")[0],
      studyType: 0,
      instructorId: null,
      directorId: null,
      studentName: studentFullData?.fullName ?? "",
      program: studentFullData?.program ?? "",
      nationality: studentFullData?.nationality ?? "",
    },
    validate: {
      studentName: (v) => (!v ? "Student name is required" : null),
      program: (v) => (!v ? "Program is required" : null),
    },
    onSubmit: (values) => onSubmit(values),
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Stack gap="md">
        <TextInput
          label="Student Name"
          placeholder="Full name as shown on certificate"
          {...form.getInputProps("studentName")}
          disabled={isLoading}
          required
        />
        <TextInput
          label="Program"
          placeholder="e.g., Business Administration"
          {...form.getInputProps("program")}
          disabled={isLoading}
          required
        />
        <TextInput
          label="Nationality"
          placeholder="e.g., American"
          {...form.getInputProps("nationality")}
          disabled={isLoading}
        />
        <TextInput
          label="Issue Date"
          type="date"
          {...form.getInputProps("issueDate")}
          disabled={isLoading}
        />
        <Select
          label="Study Status"
          data={[
            { value: "0", label: "Currently Studying (履修している)" },
            { value: "1", label: "Completed (履修した)" },
          ]}
          value={String(form.values.studyType)}
          onChange={(v) => form.setFieldValue("studyType", v === "1" ? 1 : 0)}
          disabled={isLoading}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Create Certificate
        </Button>
      </Stack>
    </form>
  );
}
