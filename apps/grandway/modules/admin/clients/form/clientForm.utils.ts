import type {
  ClientRow,
  ContactNumberInput,
  ContactNumberValues,
  CreateClientPayload,
  CreateClientValues,
  UpdateClientPayload,
  UpdateClientValues,
} from "../clients.types";

export const CONTACT_LABEL_OPTIONS: {
  value: ContactNumberValues["label"];
  label: string;
}[] = [
  { value: "mobile", label: "Mobile" },
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "viber", label: "Viber" },
  { value: "other", label: "Other" },
];

export const EMPTY_CONTACT_ROW: ContactNumberValues = {
  number: "",
  label: "mobile",
  is_primary: false,
};

export const INITIAL_CLIENT_VALUES: CreateClientValues = {
  name: "",
  spokesperson_name: "",
  spokesperson_designation: "",
  email: "",
  website: "",
  logo_url: "",
  address: "",
  notes: "",
  contact_numbers: [],
};

/** Map an existing record (edit prefill) onto the fully-populated form shape. */
export function toClientFormValues(
  record?: Partial<ClientRow>,
): CreateClientValues {
  if (!record) return INITIAL_CLIENT_VALUES;
  return {
    name: record.name ?? "",
    spokesperson_name: record.spokesperson_name ?? "",
    spokesperson_designation: record.spokesperson_designation ?? "",
    email: record.email ?? "",
    website: record.website ?? "",
    logo_url: record.logo_url ?? "",
    address: record.address ?? "",
    notes: record.notes ?? "",
    contact_numbers: (record.contact_numbers ?? []).map((c) => ({
      number: c.number,
      label: c.label,
      is_primary: c.is_primary,
    })),
  };
}

/** Strip the read-only `id` and trim — the write shape is `{ number, label?, is_primary? }`. */
function toContactInputs(rows: ContactNumberValues[]): ContactNumberInput[] {
  return rows.map((c) => ({
    number: c.number.trim(),
    label: c.label,
    is_primary: c.is_primary,
  }));
}

/**
 * Create payload. `contact_numbers` is sent only when non-empty (the backend
 * defaults an omitted key to `[]`), so an empty repeater sends nothing rather
 * than an explicit clear.
 */
export function toCreatePayload(
  values: CreateClientValues,
): CreateClientPayload {
  const contacts = toContactInputs(values.contact_numbers);
  const payload: CreateClientPayload = {
    name: values.name.trim(),
    spokesperson_name: values.spokesperson_name.trim(),
    spokesperson_designation: values.spokesperson_designation.trim(),
    email: values.email.trim(),
    website: values.website.trim(),
    logo_url: values.logo_url.trim(),
    address: values.address.trim(),
    notes: values.notes.trim(),
  };
  if (contacts.length > 0) payload.contact_numbers = contacts;
  return payload;
}

/** Are two contact sets identical (order-sensitive, ignoring `id`)? */
function contactsEqual(
  a: ContactNumberInput[],
  b: ContactNumberInput[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((x, i) => {
    const y = b[i];
    return (
      x.number === y.number &&
      x.label === y.label &&
      x.is_primary === y.is_primary
    );
  });
}

/**
 * Update payload — only the fields the user actually changed. A read-modify-
 * write of the whole object fails: `status`/retirement fields are rejected, and
 * an unchanged `contact_numbers` would needlessly write a history event (§3).
 * `contact_numbers` (a wholesale replacement set) is included only when the
 * repeater differs from the record's current numbers.
 */
export function toUpdatePayload(
  values: UpdateClientValues,
  record: ClientRow,
): UpdateClientPayload {
  const payload: UpdateClientPayload = {};

  const scalarChanges: Array<
    [keyof CreateClientValues & keyof ClientRow, string]
  > = [
    ["name", values.name.trim()],
    ["spokesperson_name", values.spokesperson_name.trim()],
    ["spokesperson_designation", values.spokesperson_designation.trim()],
    ["email", values.email.trim()],
    ["website", values.website.trim()],
    ["logo_url", values.logo_url.trim()],
    ["address", values.address.trim()],
    ["notes", values.notes.trim()],
  ];
  for (const [key, next] of scalarChanges) {
    if (next !== (record[key] ?? "")) {
      (payload as Record<string, unknown>)[key] = next;
    }
  }

  const nextContacts = toContactInputs(values.contact_numbers);
  const currentContacts = toContactInputs(
    record.contact_numbers.map((c) => ({
      number: c.number,
      label: c.label,
      is_primary: c.is_primary,
    })),
  );
  if (!contactsEqual(nextContacts, currentContacts)) {
    payload.contact_numbers = nextContacts;
  }

  return payload;
}

/** Client-side guard for `CLIENTS_CONTACT_NUMBER_DUPLICATE` — the same number twice in one payload. */
export function findDuplicateContactNumber(
  rows: ContactNumberValues[],
): string | null {
  const seen = new Set<string>();
  for (const row of rows) {
    const number = row.number.trim();
    if (!number) continue;
    if (seen.has(number)) return number;
    seen.add(number);
  }
  return null;
}
