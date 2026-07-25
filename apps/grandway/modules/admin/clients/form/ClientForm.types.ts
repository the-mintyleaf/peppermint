import type { ModalFormComponentProps } from "@peppermint/admin";
import type { ClientRow, CreateClientValues } from "../clients.types";

/**
 * One shared component serves both create and edit slots. The record generic is
 * `ClientRow` (the shell's row type — `ClientDetail` widened with the list-only
 * `primary_contact_number`); the form-values generic is `CreateClientValues`.
 * `UpdateClientValues` is the same shape, so the same props type fits the edit
 * slot too — no `as unknown as` casts.
 */
export type ClientFormProps = ModalFormComponentProps<
  ClientRow,
  CreateClientValues
>;
