import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Address } from "../_shared";

/** Address form state — strings + the primary flag; the api payload drops empties. */
export interface AddressFormValues extends Record<string, unknown> {
  address_type: string;
  country: string;
  province_or_state: string;
  district: string;
  municipality: string;
  ward: string;
  locality: string;
  street: string;
  postal_code: string;
  address_text: string;
  is_primary: boolean;
  valid_from: string;
  valid_to: string;
}

/** Cleaned create/update payload the form emits (empties dropped; dates omitted if unset). */
export interface AddressPayload extends Record<string, unknown> {
  address_type: string;
  is_primary: boolean;
}

export type AddressFormProps = ModalFormComponentProps<Address, AddressPayload>;
