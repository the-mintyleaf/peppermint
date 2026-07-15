"use client";

import { createChildResource } from "../_shared";
import type { Address } from "../_shared";
import { AddressForm } from "./AddressForm";
import type { AddressPayload } from "./AddressForm.types";
import { addressColumns } from "./addresses.columns";

/**
 * Addresses CRUD table for the current applicant (§3). Staff-permitted; the server
 * demotes the previous primary on a new primary and rejects a locked/archived parent.
 */
export const AddressesSection = createChildResource<
  Address,
  AddressPayload,
  AddressPayload
>({
  slug: "addresses",
  moduleInfo: {
    name: "address",
    label: "Addresses",
    description: "Structured and free-text addresses",
  },
  columns: addressColumns,
  createFormComponent: AddressForm,
  createModalTitle: "Add address",
  editModalTitle: "Edit address",
  modalWidth: 640,
});
