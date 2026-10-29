"use client";

import {
  DateInput,
  Grid,
  Input,
  NumberInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  TagsInput,
  TextInput,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { FormSection } from "@/components/FormSection";
import { toCertificateGender } from "./certificateContent";
import { CERTIFICATE_GRADES, MAX_TEXTBOOKS } from "./certificateForm.utils";
import type {
  CertificateFormValues,
  CertificateSectionProps,
  CertificateSignatorySectionProps,
} from "./CertificateForm.types";

const GRADE_OPTIONS = CERTIFICATE_GRADES.map((g) => ({ value: g, label: g }));

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const SKILLS = [
  { name: "grammar", label: "Grammar" },
  { name: "listening", label: "Listening" },
  { name: "conversation", label: "Conversation" },
  { name: "reading", label: "Reading" },
  { name: "composition", label: "Composition" },
] as const;

/** A `SegmentedControl` has no error slot; its wrapper carries the message. */
function fieldError(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

export function CertificateStudentSection({
  disabled,
}: CertificateSectionProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  return (
    <FormSection title="Student">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
        <TextInput
          label="First name"
          placeholder="Sita"
          autoComplete="given-name"
          required
          maxLength={150}
          disabled={disabled}
          {...form.getInputProps("firstname")}
        />
        <TextInput
          label="Middle name (optional)"
          placeholder="Kumari"
          autoComplete="additional-name"
          maxLength={150}
          disabled={disabled}
          {...form.getInputProps("middlename")}
        />
        <TextInput
          label="Last name"
          placeholder="Shrestha"
          autoComplete="family-name"
          required
          maxLength={150}
          disabled={disabled}
          {...form.getInputProps("lastname")}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <DateInput
          label="Date of birth"
          placeholder="2004-08-17"
          valueFormat="YYYY-MM-DD"
          required
          disabled={disabled}
          {...form.getInputProps("date_of_birth")}
        />
        <Input.Wrapper
          label="Gender"
          required
          error={fieldError(form.errors.gender)}
        >
          <SegmentedControl
            fullWidth
            mt={4}
            aria-label="Gender"
            data={GENDER_OPTIONS}
            disabled={disabled}
            value={form.values.gender}
            onChange={(v) =>
              form.setFieldValue("gender", toCertificateGender(v))
            }
          />
        </Input.Wrapper>
      </SimpleGrid>
      <TextInput
        label="Current address"
        placeholder="Bagbazar, Kathmandu"
        autoComplete="street-address"
        required
        maxLength={300}
        disabled={disabled}
        {...form.getInputProps("address")}
      />
    </FormSection>
  );
}

export function CertificateCourseSection({
  disabled,
}: CertificateSectionProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  const totalHours =
    (Number(form.values.course_total_days) || 0) *
    (Number(form.values.course_hours_per_day) || 0);
  return (
    <FormSection title="Course">
      <Grid gap="sm">
        <Grid.Col span={{ base: 12, sm: 8 }}>
          <TextInput
            label="Course name"
            placeholder="Japanese Language Course"
            required
            maxLength={150}
            disabled={disabled}
            {...form.getInputProps("course_name")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <TextInput
            label="Target level"
            placeholder="N5"
            required
            maxLength={50}
            disabled={disabled}
            {...form.getInputProps("course_level")}
          />
        </Grid.Col>
      </Grid>
      <TagsInput
        label="Textbooks (optional)"
        description={`Press Enter after each title. Up to ${MAX_TEXTBOOKS}.`}
        placeholder="Minna no Nihongo I"
        maxTags={MAX_TEXTBOOKS}
        disabled={disabled}
        {...form.getInputProps("course_books")}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <NumberInput
          label="Course length in days (optional)"
          placeholder="150"
          min={0}
          max={1000}
          allowDecimal={false}
          hideControls
          disabled={disabled}
          {...form.getInputProps("course_total_days")}
        />
        <NumberInput
          label="Class hours per day"
          placeholder="2"
          min={0}
          max={24}
          decimalScale={1}
          hideControls
          required
          description={
            totalHours > 0 ? `${totalHours} hours in total` : undefined
          }
          disabled={disabled}
          {...form.getInputProps("course_hours_per_day")}
        />
      </SimpleGrid>
    </FormSection>
  );
}

export function CertificateDatesSection({ disabled }: CertificateSectionProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  return (
    <FormSection title="Dates and status">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
        <DateInput
          label="Admission"
          placeholder="2026-01-15"
          valueFormat="YYYY-MM-DD"
          required
          disabled={disabled}
          {...form.getInputProps("date_of_admission")}
        />
        <DateInput
          label="Completion (optional)"
          placeholder="2026-07-15"
          valueFormat="YYYY-MM-DD"
          clearable
          minDate={form.values.date_of_admission ?? undefined}
          disabled={disabled}
          {...form.getInputProps("date_of_completion")}
        />
        <DateInput
          label="Issue date"
          valueFormat="YYYY-MM-DD"
          required
          disabled={disabled}
          {...form.getInputProps("issue")}
        />
      </SimpleGrid>
      <Input.Wrapper
        label="Study status"
        error={fieldError(form.errors.study_type)}
      >
        <SegmentedControl
          fullWidth
          mt={4}
          aria-label="Study status"
          data={[
            { value: "0", label: "Currently studying" },
            { value: "1", label: "Completed" },
          ]}
          disabled={disabled}
          value={form.values.study_type}
          onChange={(v) =>
            form.setFieldValue("study_type", v === "1" ? "1" : "0")
          }
        />
      </Input.Wrapper>
    </FormSection>
  );
}

export function CertificateGradesSection({
  disabled,
}: CertificateSectionProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  return (
    <FormSection
      title="Grades"
      description="A Excellent · B Good · C Fair · D Poor"
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {SKILLS.map((skill) => (
          <Input.Wrapper
            key={skill.name}
            label={skill.label}
            error={fieldError(form.errors[skill.name])}
          >
            <SegmentedControl
              fullWidth
              mt={4}
              aria-label={`${skill.label} grade`}
              data={GRADE_OPTIONS}
              disabled={disabled}
              value={form.values[skill.name]}
              onChange={(v) =>
                form.setFieldValue(
                  skill.name,
                  v as CertificateFormValues[typeof skill.name],
                )
              }
            />
          </Input.Wrapper>
        ))}
      </SimpleGrid>
    </FormSection>
  );
}

export function CertificateSignatorySection({
  disabled,
  signatureOptions,
}: CertificateSignatorySectionProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  return (
    <FormSection title="Signatories and branch">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <Select
          label="Instructor"
          placeholder="Pick a signatory"
          data={signatureOptions}
          value={form.values.instructor_id ?? ""}
          onChange={(v) => form.setFieldValue("instructor_id", v || null)}
          error={fieldError(form.errors.instructor_id)}
          searchable
          disabled={disabled}
        />
        <Select
          label="Managing director"
          placeholder="Pick a signatory"
          data={signatureOptions}
          value={form.values.director_id ?? ""}
          onChange={(v) => form.setFieldValue("director_id", v || null)}
          error={fieldError(form.errors.director_id)}
          searchable
          disabled={disabled}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <TextInput
          label="Branch address (optional)"
          description="Printed under the head office line."
          placeholder="Branch Office : Butwal, Rupandehi"
          maxLength={150}
          disabled={disabled}
          {...form.getInputProps("branch_name")}
        />
        <TextInput
          label="Branch phone (optional)"
          description="Printed after “Branch :” in the contact block."
          placeholder="071-123456"
          inputMode="tel"
          maxLength={50}
          disabled={disabled}
          {...form.getInputProps("branch_no")}
        />
      </SimpleGrid>
    </FormSection>
  );
}
