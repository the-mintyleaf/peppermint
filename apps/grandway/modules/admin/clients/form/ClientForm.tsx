"use client";

import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import {
  Avatar,
  Button,
  Group,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { z } from "zod";
import type { CreateClientValues } from "../clients.types";
import type { ClientFormProps } from "./ClientForm.types";
import { ClientContactNumbersField } from "./ClientContactNumbersField";
import {
  findDuplicateContactNumber,
  toClientFormValues,
} from "./clientForm.utils";

/** Allow blank, otherwise require an `http(s)://` URL — format only, not reachability (§3). */
const optionalUrl = z
  .string()
  .refine((v) => !v || /^https?:\/\/\S+$/i.test(v.trim()), "Enter a valid URL");

const schema = z.object({
  name: z.string().min(1, "Required").max(255),
  spokesperson_name: z.string().max(255),
  spokesperson_designation: z.string().max(255),
  email: z
    .string()
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
  website: optionalUrl,
  logo_url: optionalUrl,
  address: z.string(),
  notes: z.string(),
  contact_numbers: z.array(
    z.object({
      number: z
        .string()
        .min(1, "Required")
        .regex(/^\+?[0-9][0-9 ()\-]{4,31}$/, "Enter a valid phone number"),
      label: z.enum(["mobile", "home", "work", "whatsapp", "viber", "other"]),
      is_primary: z.boolean(),
    }),
  ),
});

/**
 * Shared create + edit modal form (`POST`/`PATCH /api/v1/clients/`). Only `name`
 * is required. No `status`/retirement fields — standing moves only through the
 * retire/restore actions. The changed-field diff for PATCH happens in
 * `toUpdatePayload` (called by the list page's `onEditApi`), so this form always
 * emits the full value set.
 */
export function ClientForm({
  onSubmit,
  isLoading,
  initialValues,
}: ClientFormProps) {
  const initial = toClientFormValues(initialValues);

  return (
    <FormWrapper<CreateClientValues>
      initial={initial}
      validation={[schema]}
      finalSubmitFn={async (values) => {
        const duplicate = findDuplicateContactNumber(values.contact_numbers);
        if (duplicate) {
          return {
            ok: false,
            message: `The number "${duplicate}" appears more than once.`,
          };
        }
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <ClientFormFields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} isEdit={Boolean(initialValues)} />
      </Stack>
    </FormWrapper>
  );
}

function ClientFormFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<CreateClientValues>();
  const logoUrl = form.values.logo_url.trim();
  const logoValid = /^https?:\/\/\S+$/i.test(logoUrl);

  return (
    <>
      <TextInput
        label="Organization name"
        placeholder="e.g. Everest Partner Agency"
        required
        disabled={isLoading}
        {...form.getInputProps("name")}
      />

      <Group grow align="flex-start">
        <TextInput
          label="Spokesperson name"
          placeholder="Contact person"
          disabled={isLoading}
          {...form.getInputProps("spokesperson_name")}
        />
        <TextInput
          label="Designation"
          placeholder="e.g. Managing Director"
          disabled={isLoading}
          {...form.getInputProps("spokesperson_designation")}
        />
      </Group>

      <Group grow align="flex-start">
        <TextInput
          label="Email"
          type="email"
          placeholder="contact@example.com"
          autoComplete="off"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
        <TextInput
          label="Website"
          placeholder="https://example.com"
          disabled={isLoading}
          {...form.getInputProps("website")}
        />
      </Group>

      <Group align="flex-end" wrap="nowrap" gap="sm">
        <TextInput
          label="Logo URL"
          placeholder="https://example.com/logo.png"
          description="A link to an existing image — not an upload."
          style={{ flex: 1 }}
          disabled={isLoading}
          {...form.getInputProps("logo_url")}
        />
        {logoValid ? (
          // Plain external URL — Avatar renders an <img>, deliberately not
          // next/image (arbitrary third-party host, §3/§9).
          <Avatar src={logoUrl} alt="Logo preview" size="lg" radius="sm" />
        ) : null}
      </Group>

      <Textarea
        label="Address"
        placeholder="Street, city, country"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("address")}
      />

      <ClientContactNumbersField isLoading={isLoading} />

      <Textarea
        label="Notes"
        placeholder="Anything staff should know about this partner"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("notes")}
      />
    </>
  );
}

function SubmitButton({
  isLoading,
  isEdit,
}: {
  isLoading: boolean;
  isEdit: boolean;
}) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      {isEdit ? "Save changes" : "Add client"}
    </Button>
  );
}
