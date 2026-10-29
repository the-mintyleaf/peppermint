"use client";

import { Fragment } from "react";
import { Stack, Button, Text, TextInput, Textarea } from "@peppermint/ui";
import { useForm } from "@peppermint/ui";
import { bindClipboardFields } from "@/modules/admin/clipboard";
import { DocumentPhotoField } from "../../components/DocumentPhotoField";
import type { DocumentFormProps, CvContent } from "../../documents.types";

// One clipboard key per reference column, shared by both references — a referee
// saved from Reference 1 is offered under Reference 2 as well.
const REFERENCE_FIELDS = [
  { suffix: "name", label: "Name" },
  { suffix: "title", label: "Title / Position" },
  { suffix: "institution", label: "Institution" },
  { suffix: "address", label: "Address" },
  { suffix: "email", label: "Email" },
  { suffix: "contact", label: "Contact Number" },
] as const;

const REFERENCES = [
  { prefix: "ref1", title: "Reference 1" },
  { prefix: "ref2", title: "Reference 2 (optional)" },
] as const;

export function CvExtendedForm({
  applicantId,
  studentFullData,
  onSubmit,
  isLoading,
}: DocumentFormProps) {
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
  });
  const clip = bindClipboardFields(form, { family: "cv", disabled: isLoading });

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
          {...clip("nationality", "Nationality")}
          disabled={isLoading}
        />
        <TextInput
          label="Language Known"
          {...form.getInputProps("languages_known")}
          {...clip("languages_known", "Languages known")}
          disabled={isLoading}
        />
        <TextInput
          label="Religion"
          {...form.getInputProps("religion")}
          {...clip("religion", "Religion")}
          disabled={isLoading}
        />
        <TextInput
          label="Alternate Email"
          {...form.getInputProps("alternate_email")}
          {...clip("alternate_email", "Alternate email")}
          disabled={isLoading}
        />
        <TextInput
          label="Passport Number"
          {...form.getInputProps("passport_number")}
          {...clip("passport_number", "Passport number")}
          disabled={isLoading}
        />

        <Text fw={600} size="sm">
          Skills
        </Text>
        <Textarea
          label="Skills (one per line)"
          placeholder={
            "Leadership & Team Management\nCommunication Skills\nTime Management"
          }
          autosize
          minRows={3}
          {...form.getInputProps("skills")}
          {...clip("skills", "Skills", { multiline: true })}
          disabled={isLoading}
        />

        <Text fw={600} size="sm">
          Courses & Training
        </Text>
        <Textarea
          label="Courses and Training (one per line)"
          placeholder={
            "Hospital Preparedness for Emergencies (HOPE) course\nTraining on Infection control and prevention"
          }
          autosize
          minRows={3}
          {...form.getInputProps("courses_training")}
          {...clip("courses_training", "Courses and training", {
            multiline: true,
          })}
          disabled={isLoading}
        />

        {REFERENCES.map((reference) => (
          <Fragment key={reference.prefix}>
            <Text fw={600} size="sm">
              {reference.title}
            </Text>
            {REFERENCE_FIELDS.map((field) => {
              const path = `${reference.prefix}_${field.suffix}`;
              return (
                <TextInput
                  key={path}
                  label={field.label}
                  {...form.getInputProps(path)}
                  {...clip(path, `${reference.title} — ${field.label}`, {
                    clipboardKey: `cv.reference.${field.suffix}`,
                  })}
                  disabled={isLoading}
                />
              );
            })}
          </Fragment>
        ))}

        <Button type="submit" loading={isLoading} fullWidth>
          Create CV
        </Button>
      </Stack>
    </form>
  );
}
