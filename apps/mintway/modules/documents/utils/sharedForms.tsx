"use client";

import { Stack, TextInput, DateInput, Button, Text } from "@peppermint/ui";
import { useForm } from "@peppermint/ui";
import type { DocumentFormProps } from "../documents.types";
import { BankStatementForm } from "../components/BankStatementForm";
import { BankCertificateForm } from "../components/BankCertificateForm";

/** Statement forms use the dedicated BankStatementForm (transactions editor + auto totals). */
export const createBankStatementForm = () => BankStatementForm;

/** Certificate forms use the dedicated BankCertificateForm (balance + auto words). */
export const createBankCertificateForm = () => BankCertificateForm;

export function createLorForm(extraDefaults: Record<string, unknown> = {}) {
  return function LorVariantForm({ onSubmit, isLoading }: DocumentFormProps) {
    const form = useForm({
      initialValues: {
        lor_ref_no: "",
        lor_letter_no: "",
        lor_date: new Date().toISOString().split("T")[0],
        student_honorific: "Mr.",
        student_name: "",
        student_first_name: "",
        student_last_name: "",
        student_pronoun: "him",
        recommender_honorific: "",
        recommender_name: "",
        recommender_title: "",
        recommender_dept: "",
        recommender_contact: "",
        recommender_email: "",
        ...extraDefaults,
      },
    });

    const extraFields = Object.keys(extraDefaults);

    return (
      <form onSubmit={form.onSubmit((values) => onSubmit(values as never))}>
        <Stack gap="md" p="md">
          <Text fw={600} size="sm">
            Letter
          </Text>
          <TextInput
            label="Ref. No."
            {...form.getInputProps("lor_ref_no")}
            disabled={isLoading}
          />
          <TextInput
            label="Letter No. (optional)"
            {...form.getInputProps("lor_letter_no")}
            disabled={isLoading}
          />
          <DateInput
            label="Date"
            valueFormat="YYYY-MM-DD"
            clearable
            {...form.getInputProps("lor_date")}
            disabled={isLoading}
          />
          <Text fw={600} size="sm">
            Student
          </Text>
          <TextInput
            label="Honorific (Mr. / Ms. / Mrs.)"
            {...form.getInputProps("student_honorific")}
            disabled={isLoading}
          />
          <TextInput
            label="Full Name"
            {...form.getInputProps("student_name")}
            required
            disabled={isLoading}
          />
          <TextInput
            label="First Name (for informal references)"
            {...form.getInputProps("student_first_name")}
            disabled={isLoading}
          />
          <TextInput
            label="Last Name (for Mr. Last style)"
            {...form.getInputProps("student_last_name")}
            disabled={isLoading}
          />
          <TextInput
            label="Pronoun (him / her)"
            {...form.getInputProps("student_pronoun")}
            disabled={isLoading}
          />
          {extraFields.map((key) => (
            <TextInput
              key={key}
              label={key.replace(/_/g, " ")}
              {...form.getInputProps(key)}
              disabled={isLoading}
            />
          ))}
          <Text fw={600} size="sm">
            Recommender
          </Text>
          <TextInput
            label="Honorific (Dr. / Er. / Asst. Prof.)"
            {...form.getInputProps("recommender_honorific")}
            disabled={isLoading}
          />
          <TextInput
            label="Name"
            {...form.getInputProps("recommender_name")}
            required
            disabled={isLoading}
          />
          <TextInput
            label="Title / Position"
            {...form.getInputProps("recommender_title")}
            disabled={isLoading}
          />
          <TextInput
            label="Department (optional)"
            {...form.getInputProps("recommender_dept")}
            disabled={isLoading}
          />
          <TextInput
            label="Contact No. (optional)"
            {...form.getInputProps("recommender_contact")}
            disabled={isLoading}
          />
          <TextInput
            label="Email (optional)"
            {...form.getInputProps("recommender_email")}
            disabled={isLoading}
          />
          <Button type="submit" loading={isLoading} fullWidth>
            Create Document
          </Button>
        </Stack>
      </form>
    );
  };
}

export function createMoiForm(extraDefaults: Record<string, unknown> = {}) {
  return function MoiVariantForm({ onSubmit, isLoading }: DocumentFormProps) {
    const form = useForm({
      initialValues: {
        moi_ref_no: "",
        moi_date: new Date().toISOString().split("T")[0],
        student_honorific: "Mr.",
        student_name: "",
        student_last_name: "",
        student_pronoun: "him",
        signatory_name: "",
        signatory_contact: "",
        signatory_email: "",
        ...extraDefaults,
      },
    });

    const extraFields = Object.keys(extraDefaults);

    return (
      <form onSubmit={form.onSubmit((values) => onSubmit(values as never))}>
        <Stack gap="md" p="md">
          <Text fw={600} size="sm">
            Letter
          </Text>
          <TextInput
            label="Ref. No."
            {...form.getInputProps("moi_ref_no")}
            disabled={isLoading}
          />
          <DateInput
            label="Date"
            valueFormat="YYYY-MM-DD"
            clearable
            {...form.getInputProps("moi_date")}
            disabled={isLoading}
          />
          <Text fw={600} size="sm">
            Student
          </Text>
          <TextInput
            label="Honorific (Mr. / Ms. / Mrs.)"
            {...form.getInputProps("student_honorific")}
            disabled={isLoading}
          />
          <TextInput
            label="Full Name"
            {...form.getInputProps("student_name")}
            required
            disabled={isLoading}
          />
          <TextInput
            label="Last Name (for Mr. Last style)"
            {...form.getInputProps("student_last_name")}
            disabled={isLoading}
          />
          <TextInput
            label="Pronoun (him / her)"
            {...form.getInputProps("student_pronoun")}
            disabled={isLoading}
          />
          {extraFields.map((key) => (
            <TextInput
              key={key}
              label={key.replace(/_/g, " ")}
              {...form.getInputProps(key)}
              disabled={isLoading}
            />
          ))}
          <Text fw={600} size="sm">
            Signatory
          </Text>
          <TextInput
            label="Name"
            {...form.getInputProps("signatory_name")}
            required
            disabled={isLoading}
          />
          <TextInput
            label="Contact No. (optional)"
            {...form.getInputProps("signatory_contact")}
            disabled={isLoading}
          />
          <TextInput
            label="Email (optional)"
            {...form.getInputProps("signatory_email")}
            disabled={isLoading}
          />
          <Button type="submit" loading={isLoading} fullWidth>
            Create Document
          </Button>
        </Stack>
      </form>
    );
  };
}
