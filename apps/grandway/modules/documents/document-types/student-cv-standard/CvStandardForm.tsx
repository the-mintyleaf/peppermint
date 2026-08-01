"use client";

import {
  Stack,
  Button,
  Text,
  TextInput,
  DateInput,
  Textarea,
} from "@peppermint/ui";
import { useForm } from "@peppermint/ui";
import { DocumentPhotoField } from "../../components/DocumentPhotoField";
import type { DocumentFormProps, CvContent } from "../../documents.types";

export function CvStandardForm({
  applicantId,
  studentFullData,
  onSubmit,
  isLoading,
}: DocumentFormProps) {
  const form = useForm({
    initialValues: {
      nationality: "Nepali",
      languages_known: "Nepali, English",
      passport_number: "",
      passport_issue_date: "",
      passport_expiry_date: "",
      ielts_overall: "",
      ielts_date: "",
      ielts_listening: "",
      ielts_reading: "",
      ielts_writing: "",
      ielts_speaking: "",
      skills: "",
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const content: CvContent = {
      summary: studentFullData?.summary ?? "",
      experience: studentFullData?.experience ?? "",
      ...values,
    };
    onSubmit(content);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md" p="md">
        <DocumentPhotoField
          applicantId={applicantId}
          name={studentFullData?.fullName}
        />

        <Text size="sm" c="dimmed">
          A CV will be generated from{" "}
          {studentFullData?.fullName ?? "the student"}&apos;s profile data. Fill
          in any additional details below.
        </Text>

        <Text fw={600} size="sm">
          Personal Details
        </Text>
        <TextInput
          label="Nationality"
          {...form.getInputProps("nationality")}
          disabled={isLoading}
        />
        <TextInput
          label="Language Known"
          {...form.getInputProps("languages_known")}
          disabled={isLoading}
        />

        <Text fw={600} size="sm">
          Passport Details
        </Text>
        <TextInput
          label="Passport Number"
          {...form.getInputProps("passport_number")}
          disabled={isLoading}
        />
        <DateInput
          label="Date of Issue"
          valueFormat="YYYY-MM-DD"
          clearable
          {...form.getInputProps("passport_issue_date")}
          disabled={isLoading}
        />
        <DateInput
          label="Date of Expiry"
          valueFormat="YYYY-MM-DD"
          clearable
          {...form.getInputProps("passport_expiry_date")}
          disabled={isLoading}
        />

        <Text fw={600} size="sm">
          IELTS Achievement (optional)
        </Text>
        <DateInput
          label="Exam Date"
          valueFormat="YYYY-MM-DD"
          clearable
          {...form.getInputProps("ielts_date")}
          disabled={isLoading}
        />
        <TextInput
          label="Overall Score"
          placeholder="e.g. 6.0"
          {...form.getInputProps("ielts_overall")}
          disabled={isLoading}
        />
        <TextInput
          label="Listening"
          placeholder="e.g. 6.5"
          {...form.getInputProps("ielts_listening")}
          disabled={isLoading}
        />
        <TextInput
          label="Reading"
          placeholder="e.g. 5.5"
          {...form.getInputProps("ielts_reading")}
          disabled={isLoading}
        />
        <TextInput
          label="Writing"
          placeholder="e.g. 6.0"
          {...form.getInputProps("ielts_writing")}
          disabled={isLoading}
        />
        <TextInput
          label="Speaking"
          placeholder="e.g. 6.0"
          {...form.getInputProps("ielts_speaking")}
          disabled={isLoading}
        />

        <Text fw={600} size="sm">
          Skills
        </Text>
        <Textarea
          label="Skills (one per line)"
          placeholder={"Time Management\nCreativity\nCritical Thinking"}
          autosize
          minRows={3}
          {...form.getInputProps("skills")}
          disabled={isLoading}
        />

        <Button type="submit" loading={isLoading} fullWidth>
          Create CV
        </Button>
      </Stack>
    </form>
  );
}
