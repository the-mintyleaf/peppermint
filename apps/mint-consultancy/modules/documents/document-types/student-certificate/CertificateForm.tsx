"use client";

import { Stack, TextInput, Select, Button } from "@zetsel/ui";
import { useForm } from "@zetsel/ui";
import type { DocumentFormProps, CertificateContent } from "../../documents.types";

export function CertificateForm({
  studentFullData,
  initialContent,
  signatures = [],
  onSubmit,
  isLoading,
}: DocumentFormProps) {
  const existing = initialContent as CertificateContent | undefined;
  const today = new Date().toISOString().split("T")[0];

  const signatureOptions = [
    { value: "", label: "Blank" },
    ...signatures.map((sig) => ({ value: sig.id, label: sig.name })),
  ];

  const form = useForm<CertificateContent>({
    initialValues: {
      issue: existing?.issue ?? existing?.issueDate ?? today,
      issueDate: existing?.issueDate ?? existing?.issue ?? today,
      studyType: existing?.studyType ?? 0,
      instructorId: existing?.instructorId ?? null,
      directorId: existing?.directorId ?? null,
      studentName: existing?.studentName ?? studentFullData?.fullName ?? "",
      program: existing?.program ?? studentFullData?.program ?? "",
      nationality: existing?.nationality ?? studentFullData?.nationality ?? "",
    },
    validate: {
      studentName: (v) => (!v ? "Student name is required" : null),
      program: (v) => (!v ? "Program is required" : null),
    },
    onSubmit: (values) => onSubmit(values),
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Stack gap="md" p="md">
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
          {...form.getInputProps("issue")}
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
        <Select
          label="Instructor"
          placeholder="Select instructor"
          data={signatureOptions}
          value={form.values.instructorId ?? ""}
          onChange={(v) => form.setFieldValue("instructorId", v || null)}
          searchable
          clearable
          disabled={isLoading}
        />
        <Select
          label="Managing Director"
          placeholder="Select director"
          data={signatureOptions}
          value={form.values.directorId ?? ""}
          onChange={(v) => form.setFieldValue("directorId", v || null)}
          searchable
          clearable
          disabled={isLoading}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          {existing ? "Save Changes" : "Create Certificate"}
        </Button>
      </Stack>
    </form>
  );
}
