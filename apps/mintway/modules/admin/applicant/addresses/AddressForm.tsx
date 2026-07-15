"use client";

import {
  Button,
  Checkbox,
  Group,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import { ADDRESS_TYPE_LABELS, toOptions } from "../_shared";
import type { Address } from "../_shared";
import type {
  AddressFormProps,
  AddressFormValues,
  AddressPayload,
} from "./AddressForm.types";

const ADDRESS_TYPE_OPTIONS = toOptions(ADDRESS_TYPE_LABELS);

const INITIAL: AddressFormValues = {
  address_type: "current",
  country: "",
  province_or_state: "",
  district: "",
  municipality: "",
  ward: "",
  locality: "",
  street: "",
  postal_code: "",
  address_text: "",
  is_primary: false,
  valid_from: "",
  valid_to: "",
};

function toInitial(record?: Partial<Address>): AddressFormValues {
  if (!record) return INITIAL;
  return {
    address_type: record.address_type ?? "current",
    country: record.country ?? "",
    province_or_state: record.province_or_state ?? "",
    district: record.district ?? "",
    municipality: record.municipality ?? "",
    ward: record.ward ?? "",
    locality: record.locality ?? "",
    street: record.street ?? "",
    postal_code: record.postal_code ?? "",
    address_text: record.address_text ?? "",
    is_primary: Boolean(record.is_primary),
    valid_from: record.valid_from ? record.valid_from.slice(0, 10) : "",
    valid_to: record.valid_to ? record.valid_to.slice(0, 10) : "",
  };
}

const TEXT_KEYS: (keyof AddressFormValues)[] = [
  "country",
  "province_or_state",
  "district",
  "municipality",
  "ward",
  "locality",
  "street",
  "postal_code",
  "address_text",
];

/** Build the api payload — always send address_type + is_primary; drop empty text/dates. */
function toPayload(values: AddressFormValues): AddressPayload {
  const payload: Record<string, unknown> = {
    address_type: values.address_type,
    is_primary: values.is_primary,
  };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value === "string" && value !== "") payload[key] = value;
  }
  if (values.valid_from) payload.valid_from = values.valid_from;
  if (values.valid_to) payload.valid_to = values.valid_to;
  return payload as AddressPayload;
}

/**
 * Create/edit an applicant address. Setting Primary demotes the current primary
 * server-side. Staff can use this (addresses are staff-permitted); a locked/archived
 * parent is rejected by the server (423/409) and surfaced by the shell.
 */
export function AddressForm({
  initialValues,
  onSubmit,
  isLoading,
}: AddressFormProps) {
  return (
    <FormWrapper<AddressFormValues>
      initial={toInitial(initialValues)}
      finalSubmitFn={async (values) => {
        onSubmit(toPayload(values));
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Fields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function Fields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<AddressFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <Select
          label="Type"
          data={ADDRESS_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("address_type")}
        />
        <TextInput
          label="Country"
          disabled={isLoading}
          {...form.getInputProps("country")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Province / State"
          disabled={isLoading}
          {...form.getInputProps("province_or_state")}
        />
        <TextInput
          label="District"
          disabled={isLoading}
          {...form.getInputProps("district")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Municipality"
          disabled={isLoading}
          {...form.getInputProps("municipality")}
        />
        <TextInput
          label="Ward"
          disabled={isLoading}
          {...form.getInputProps("ward")}
        />
        <TextInput
          label="Postal code"
          disabled={isLoading}
          {...form.getInputProps("postal_code")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Locality"
          disabled={isLoading}
          {...form.getInputProps("locality")}
        />
        <TextInput
          label="Street"
          disabled={isLoading}
          {...form.getInputProps("street")}
        />
      </Group>
      <Textarea
        label="Full address (free text)"
        description="Use when the structured fields don't fit."
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("address_text")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Valid from"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("valid_from")}
        />
        <TextInput
          label="Valid to"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("valid_to")}
        />
      </Group>
      <Checkbox
        label="Primary address"
        disabled={isLoading}
        {...form.getInputProps("is_primary", { type: "checkbox" })}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save address
    </Button>
  );
}
