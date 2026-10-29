import type { QueryClient } from "@peppermint/ui";
import { getDocumentTypeConfig } from "../documentTypeConfig";
import { fetchDocumentPrefill } from "../hooks/useDocumentPrefill";
import type { DocumentContent, DocumentType } from "../documents.types";
import { getDefaultDocumentContent } from "../utils/defaultDocumentContent";
import {
  schemaUsesPrefill,
  seedContentFromPrefill,
} from "../utils/prefillDocumentContent";

export interface SeededContent {
  content: DocumentContent;
  /** The prefill was needed and could not be read — the letter starts unseeded. */
  prefillFailed: boolean;
}

/**
 * A quick-created letter's starting content: its default content, with the
 * applicant prefill written into the empty fields its form shows. Types without
 * a `formSchema` (the bank pair, the CVs, the certificate) — and letters whose
 * form has no field the prefill fills — skip the read entirely: it carries
 * identity numbers, so it is not made for nothing.
 */
export async function seededDefaultContent(
  queryClient: QueryClient,
  type: DocumentType,
  applicantId: string,
): Promise<SeededContent> {
  const content = getDefaultDocumentContent(type);
  const schema = getDocumentTypeConfig(type).formSchema;
  if (!schema || !schemaUsesPrefill(schema)) {
    return { content, prefillFailed: false };
  }
  try {
    const prefill = await fetchDocumentPrefill(queryClient, applicantId);
    return {
      content: seedContentFromPrefill(content, prefill, schema),
      prefillFailed: false,
    };
  } catch {
    // Not swallowed: the caller tells the operator the letter starts blank.
    return { content, prefillFailed: true };
  }
}
