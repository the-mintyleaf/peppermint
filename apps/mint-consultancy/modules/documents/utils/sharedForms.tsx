"use client";

import { Stack, TextInput, Button, Textarea, Text } from "@zetsel/ui";
import { useForm } from "@zetsel/ui";
import type { DocumentFormProps } from "../documents.types";

export function createWodaForm(defaultValues: Record<string, unknown> = {}) {
  return function WodaVariantForm({ onSubmit, isLoading }: DocumentFormProps) {
    const form = useForm({
      initialValues: {
        wodadoc_refno: "",
        wodadoc_date: new Date().toISOString().split("T")[0],
        applicant_name: "",
        applicant_honorific: "Mr.",
        applicant_gender: "Male",
        spokesperson_name: "",
        spokesperson_post: "",
        spokesperson_contact: "",
        ...defaultValues,
      },
      onSubmit: (values) => onSubmit(values as never),
    });

    const extraFields = Object.keys(defaultValues);

    return (
      <form onSubmit={form.onSubmit}>
        <Stack gap="md" p="md">
          <TextInput label="Ref. No." {...form.getInputProps("wodadoc_refno")} disabled={isLoading} />
          <TextInput label="Date" type="date" {...form.getInputProps("wodadoc_date")} disabled={isLoading} />
          <TextInput label="Applicant Name" {...form.getInputProps("applicant_name")} required disabled={isLoading} />
          <TextInput label="Honorific" {...form.getInputProps("applicant_honorific")} disabled={isLoading} />
          <TextInput label="Spokesperson Name" {...form.getInputProps("spokesperson_name")} disabled={isLoading} />
          <TextInput label="Spokesperson Post" {...form.getInputProps("spokesperson_post")} disabled={isLoading} />
          {extraFields.map((key) => (
            <TextInput
              key={key}
              label={key.replace(/_/g, " ")}
              {...form.getInputProps(key)}
              disabled={isLoading}
            />
          ))}
          <Button type="submit" loading={isLoading} fullWidth>
            Create Document
          </Button>
        </Stack>
      </form>
    );
  };
}

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
      onSubmit: (values) => onSubmit(values as never),
    });

    const extraFields = Object.keys(extraDefaults);

    return (
      <form onSubmit={form.onSubmit}>
        <Stack gap="md" p="md">
          <Text fw={600} size="sm">Letter</Text>
          <TextInput label="Ref. No." {...form.getInputProps("lor_ref_no")} disabled={isLoading} />
          <TextInput label="Letter No. (optional)" {...form.getInputProps("lor_letter_no")} disabled={isLoading} />
          <TextInput label="Date" type="date" {...form.getInputProps("lor_date")} disabled={isLoading} />
          <Text fw={600} size="sm">Student</Text>
          <TextInput label="Honorific (Mr. / Ms. / Mrs.)" {...form.getInputProps("student_honorific")} disabled={isLoading} />
          <TextInput label="Full Name" {...form.getInputProps("student_name")} required disabled={isLoading} />
          <TextInput label="First Name (for informal references)" {...form.getInputProps("student_first_name")} disabled={isLoading} />
          <TextInput label="Last Name (for Mr. Last style)" {...form.getInputProps("student_last_name")} disabled={isLoading} />
          <TextInput label="Pronoun (him / her)" {...form.getInputProps("student_pronoun")} disabled={isLoading} />
          {extraFields.map((key) => (
            <TextInput
              key={key}
              label={key.replace(/_/g, " ")}
              {...form.getInputProps(key)}
              disabled={isLoading}
            />
          ))}
          <Text fw={600} size="sm">Recommender</Text>
          <TextInput label="Honorific (Dr. / Er. / Asst. Prof.)" {...form.getInputProps("recommender_honorific")} disabled={isLoading} />
          <TextInput label="Name" {...form.getInputProps("recommender_name")} required disabled={isLoading} />
          <TextInput label="Title / Position" {...form.getInputProps("recommender_title")} disabled={isLoading} />
          <TextInput label="Department (optional)" {...form.getInputProps("recommender_dept")} disabled={isLoading} />
          <TextInput label="Contact No. (optional)" {...form.getInputProps("recommender_contact")} disabled={isLoading} />
          <TextInput label="Email (optional)" {...form.getInputProps("recommender_email")} disabled={isLoading} />
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
      onSubmit: (values) => onSubmit(values as never),
    });

    const extraFields = Object.keys(extraDefaults);

    return (
      <form onSubmit={form.onSubmit}>
        <Stack gap="md" p="md">
          <Text fw={600} size="sm">Letter</Text>
          <TextInput label="Ref. No." {...form.getInputProps("moi_ref_no")} disabled={isLoading} />
          <TextInput label="Date" type="date" {...form.getInputProps("moi_date")} disabled={isLoading} />
          <Text fw={600} size="sm">Student</Text>
          <TextInput label="Honorific (Mr. / Ms. / Mrs.)" {...form.getInputProps("student_honorific")} disabled={isLoading} />
          <TextInput label="Full Name" {...form.getInputProps("student_name")} required disabled={isLoading} />
          <TextInput label="Last Name (for Mr. Last style)" {...form.getInputProps("student_last_name")} disabled={isLoading} />
          <TextInput label="Pronoun (him / her)" {...form.getInputProps("student_pronoun")} disabled={isLoading} />
          {extraFields.map((key) => (
            <TextInput
              key={key}
              label={key.replace(/_/g, " ")}
              {...form.getInputProps(key)}
              disabled={isLoading}
            />
          ))}
          <Text fw={600} size="sm">Signatory</Text>
          <TextInput label="Name" {...form.getInputProps("signatory_name")} required disabled={isLoading} />
          <TextInput label="Contact No. (optional)" {...form.getInputProps("signatory_contact")} disabled={isLoading} />
          <TextInput label="Email (optional)" {...form.getInputProps("signatory_email")} disabled={isLoading} />
          <Button type="submit" loading={isLoading} fullWidth>
            Create Document
          </Button>
        </Stack>
      </form>
    );
  };
}

export function createBankForm(defaultValues: Record<string, unknown> = {}) {
  return function BankVariantForm({ onSubmit, isLoading }: DocumentFormProps) {
    const form = useForm({
      initialValues: {
        statement_account_holder: "",
        statement_account_no: "",
        statement_account_address: "",
        statement_start_date: "",
        statement_end_date: new Date().toISOString().split("T")[0],
        statement_interest: "5",
        statement_opening_balance: 0,
        statement_closing_balance: 0,
        transactions: [],
        details: {},
        ...defaultValues,
      },
      onSubmit: (values) => onSubmit(values as never),
    });

    return (
      <form onSubmit={form.onSubmit}>
        <Stack gap="md" p="md">
          <TextInput
            label="Account Holder"
            {...form.getInputProps("statement_account_holder")}
            required
            disabled={isLoading}
          />
          <TextInput
            label="Account Number"
            {...form.getInputProps("statement_account_no")}
            required
            disabled={isLoading}
          />
          <Textarea
            label="Account Address"
            {...form.getInputProps("statement_account_address")}
            disabled={isLoading}
          />
          <TextInput
            label="Period Start"
            {...form.getInputProps("statement_start_date")}
            disabled={isLoading}
          />
          <TextInput
            label="Period End"
            type="date"
            {...form.getInputProps("statement_end_date")}
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
