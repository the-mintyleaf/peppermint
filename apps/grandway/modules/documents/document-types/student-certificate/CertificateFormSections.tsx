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
import { CERTIFICATE_GRADES } from "./certificateForm.utils";
import type {
  CertificateFormValues,
  CertificateSectionProps,
  CertificateSignatorySectionProps,
} from "./CertificateForm.types";

const GRADE_OPTIONS = CERTIFICATE_GRADES.map((g) => ({ value: g, label: g }));

const SKILLS = [
  { name: "grammar", label: "Grammar" },
  { name: "listening", label: "Listening" },
  { name: "conversation", label: "Conversation" },
  { name: "reading", label: "Reading" },
  { name: "composition", label: "Composition" },
] as const;

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
          disabled={disabled}
          {...form.getInputProps("firstname")}
        />
        <TextInput
          label="Middle name (optional)"
          placeholder="Kumari"
          autoComplete="additional-name"
          disabled={disabled}
          {...form.getInputProps("middlename")}
        />
        <TextInput
          label="Last name"
          placeholder="Shrestha"
          autoComplete="family-name"
          required
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
        <Input.Wrapper label="Gender" required>
          <SegmentedControl
            fullWidth
            mt={4}
            aria-label="Gender"
            data={["Male", "Female"]}
            disabled={disabled}
            value={form.values.gender}
            onChange={(v) =>
              form.setFieldValue("gender", v === "Female" ? "Female" : "Male")
            }
          />
        </Input.Wrapper>
      </SimpleGrid>
      <TextInput
        label="Current address"
        placeholder="Bagbazar, Kathmandu"
        autoComplete="street-address"
        required
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
    (Number(form.values.course_days) || 0) *
    (Number(form.values.coursehour) || 0);
  return (
    <FormSection title="Course">
      <Grid gap="sm">
        <Grid.Col span={{ base: 12, sm: 8 }}>
          <TextInput
            label="Course name"
            placeholder="Japanese Language Course"
            required
            disabled={disabled}
            {...form.getInputProps("course_name")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <TextInput
            label="Target level"
            placeholder="N5"
            required
            disabled={disabled}
            {...form.getInputProps("course_level")}
          />
        </Grid.Col>
      </Grid>
      <TagsInput
        label="Textbooks (optional)"
        description="Press Enter after each title."
        placeholder="Minna no Nihongo I"
        disabled={disabled}
        {...form.getInputProps("textbooks")}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <NumberInput
          label="Course length in days (optional)"
          placeholder="150"
          min={0}
          allowDecimal={false}
          hideControls
          disabled={disabled}
          {...form.getInputProps("course_days")}
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
          {...form.getInputProps("coursehour")}
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
      <Input.Wrapper label="Study status">
        <SegmentedControl
          fullWidth
          mt={4}
          aria-label="Study status"
          data={[
            { value: "0", label: "Currently studying" },
            { value: "1", label: "Completed" },
          ]}
          disabled={disabled}
          value={form.values.studyType}
          onChange={(v) =>
            form.setFieldValue("studyType", v === "1" ? "1" : "0")
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
          <Input.Wrapper key={skill.name} label={skill.label}>
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
          value={form.values.instructorId ?? ""}
          onChange={(v) => form.setFieldValue("instructorId", v || null)}
          searchable
          disabled={disabled}
        />
        <Select
          label="Managing director"
          placeholder="Pick a signatory"
          data={signatureOptions}
          value={form.values.directorId ?? ""}
          onChange={(v) => form.setFieldValue("directorId", v || null)}
          searchable
          disabled={disabled}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <TextInput
          label="Branch address (optional)"
          description="Printed under the head office line."
          placeholder="Branch Office : Butwal, Rupandehi"
          disabled={disabled}
          {...form.getInputProps("customBranch")}
        />
        <TextInput
          label="Branch phone (optional)"
          description="Printed after “Branch :” in the contact block."
          placeholder="071-123456"
          inputMode="tel"
          disabled={disabled}
          {...form.getInputProps("customBranchNo")}
        />
      </SimpleGrid>
    </FormSection>
  );
}
