import type { Capabilities } from "@/config/access";
import type { DocumentFamily } from "./documents.types";

/** Every family the backend defines (`documents/INTEGRATION.md` §5). */
export const DOCUMENT_FAMILIES: readonly DocumentFamily[] = [
  "student",
  "woda",
  "lor",
  "moi",
  "bank_statement",
  "bank_certificate",
];

/**
 * The two bank families. Banks are **two** families, not one — a statement and a
 * certificate have different content shapes and different screens — so anything
 * reasoning about "bank documents" must handle both.
 */
export const BANK_FAMILIES: readonly DocumentFamily[] = [
  "bank_statement",
  "bank_certificate",
];

export function isBankFamily(family: DocumentFamily): boolean {
  return BANK_FAMILIES.includes(family);
}

/**
 * The same test from a `template_key`, for the surfaces that carry a slug rather
 * than a family. Every bank slug is prefixed `bank-` and the backend cross-validates
 * prefix against family, so the prefix is authoritative
 * (`documents/INTEGRATION.md` §5). This is the convention already used by
 * `DocumentEditorProvider.familyForType` and `documentTypeMenu.getBankPartnerType`.
 */
export function isBankTemplateKey(templateKey: string): boolean {
  return templateKey.startsWith("bank-");
}

/**
 * The families a role may see, in the backend's own order.
 *
 * **This is ergonomics, not a security control.** It keeps bank documents out of
 * lists, panels and search for a role that shouldn't be browsing them — it does not
 * stop anyone fetching one by id (a hand-edited `/documents/standalone/<id>` URL
 * reaches it). Only a backend family scope on the role enforces that; until then,
 * treat every filter built on this as a convenience, and never as the reason a
 * document is safe.
 */
export function allowedDocumentFamilies(
  capabilities: Pick<Capabilities, "documentBankFamilies">,
): readonly DocumentFamily[] {
  return capabilities.documentBankFamilies
    ? DOCUMENT_FAMILIES
    : DOCUMENT_FAMILIES.filter((family) => !isBankFamily(family));
}

/** Whether a role may see a given family. */
export function canSeeFamily(
  capabilities: Pick<Capabilities, "documentBankFamilies">,
  family: DocumentFamily,
): boolean {
  return capabilities.documentBankFamilies || !isBankFamily(family);
}
