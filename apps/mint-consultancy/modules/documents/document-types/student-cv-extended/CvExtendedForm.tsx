"use client";

import { Stack, Button, Text, TextInput, Textarea } from "@zetsel/ui";
import { useForm } from "@zetsel/ui";
import type { DocumentFormProps, CvContent } from "../../documents.types";

export function CvExtendedForm({ studentFullData, onSubmit, isLoading }: DocumentFormProps) {
  const form = useForm({
    initialValues: {
      nationality: "Nepali",
      languages_known: "Nepali, English",
      religion: "",
      alternate_email: "",
      passport_number: "",
      skills: "",
      courses_training: "",
      ref1_name: "",
      ref1_title: "",
      ref1_institution: "",
      ref1_address: "",
      ref1_email: "",
      ref1_contact: "",
      ref2_name: "",
      ref2_title: "",
      ref2_institution: "",
      ref2_address: "",
      ref2_email: "",
      ref2_contact: "",
    },
    onSubmit: (values) => {
      const content: CvContent = {
        summary: studentFullData?.summary ?? "",
        experience: studentFullData?.experience ?? "",
        ...values,
      };
      onSubmit(content);
    },
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Stack gap="md" p="md">
        <Text size="sm" c="dimmed">
          A CV will be generated from {studentFullData?.fullName ?? "the student"}&apos;s profile
          data. Fill in any additional details below.
        </Text>

        <Text fw={600} size="sm">Personal Details</Text>
        <TextInput label="Nationality" {...form.getInputProps("nationality")} disabled={isLoading} />
        <TextInput label="Language Known" {...form.getInputProps("languages_known")} disabled={isLoading} />
        <TextInput label="Religion" {...form.getInputProps("religion")} disabled={isLoading} />
        <TextInput label="Alternate Email" {...form.getInputProps("alternate_email")} disabled={isLoading} />
        <TextInput label="Passport Number" {...form.getInputProps("passport_number")} disabled={isLoading} />

        <Text fw={600} size="sm">Skills</Text>
        <Textarea
          label="Skills (one per line)"
          placeholder={"Leadership & Team Management\nCommunication Skills\nTime Management"}
          autosize
          minRows={3}
          {...form.getInputProps("skills")}
          disabled={isLoading}
        />

        <Text fw={600} size="sm">Courses & Training</Text>
        <Textarea
          label="Courses and Training (one per line)"
          placeholder={"Hospital Preparedness for Emergencies (HOPE) course\nTraining on Infection control and prevention"}
          autosize
          minRows={3}
          {...form.getInputProps("courses_training")}
          disabled={isLoading}
        />

        <Text fw={600} size="sm">Reference 1</Text>
        <TextInput label="Name" {...form.getInputProps("ref1_name")} disabled={isLoading} />
        <TextInput label="Title / Position" {...form.getInputProps("ref1_title")} disabled={isLoading} />
        <TextInput label="Institution" {...form.getInputProps("ref1_institution")} disabled={isLoading} />
        <TextInput label="Address" {...form.getInputProps("ref1_address")} disabled={isLoading} />
        <TextInput label="Email" {...form.getInputProps("ref1_email")} disabled={isLoading} />
        <TextInput label="Contact Number" {...form.getInputProps("ref1_contact")} disabled={isLoading} />

        <Text fw={600} size="sm">Reference 2 (optional)</Text>
        <TextInput label="Name" {...form.getInputProps("ref2_name")} disabled={isLoading} />
        <TextInput label="Title / Position" {...form.getInputProps("ref2_title")} disabled={isLoading} />
        <TextInput label="Institution" {...form.getInputProps("ref2_institution")} disabled={isLoading} />
        <TextInput label="Address" {...form.getInputProps("ref2_address")} disabled={isLoading} />
        <TextInput label="Email" {...form.getInputProps("ref2_email")} disabled={isLoading} />
        <TextInput label="Contact Number" {...form.getInputProps("ref2_contact")} disabled={isLoading} />

        <Button type="submit" loading={isLoading} fullWidth>Create CV</Button>
      </Stack>
    </form>
  );
}
