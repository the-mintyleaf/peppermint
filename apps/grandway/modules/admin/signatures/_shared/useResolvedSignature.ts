"use client";

import { useFileBlob } from "@/modules/admin/uploaded-files";
import type { Signatory, SignatorySource } from "../signatures.types";

/**
 * The minimum a caller needs to carry for its signature to be renderable.
 *
 * Deliberately a **structural shape rather than the `Signatory` DTO**: the
 * document editor's own render type is a different, narrower shape, and forcing
 * it to carry a full DTO — or duplicating the precedence rule on its side —
 * would be worse than naming the three fields the rule actually reads.
 */
export interface SignatureSourceRef {
  signature_source: SignatorySource;
  /** The uploaded file's id. `null` unless `signature_source` is `"uploaded"`. */
  signature_file_id: string | null;
  signature_image_url: string;
}

export interface ResolvedSignature {
  /** A URL an `<img>` can actually use, or `""` when there is nothing to render. */
  url: string;
  /** True only while uploaded bytes are in flight — a URL source resolves synchronously. */
  isLoading: boolean;
  /** The bytes failed to download. The caller decides whether a blank slot or a warning is right. */
  isError: boolean;
}

const NOTHING: ResolvedSignature = {
  url: "",
  isLoading: false,
  isError: false,
};

/**
 * Turns a signature reference into something renderable, branching on
 * **`signature_source` and nothing else** — the one rule the contract is
 * emphatic about (§3). `signature_file` is `null` in three different situations
 * (never uploaded, archived, superseded) and they are indistinguishable from the
 * payload, so a client-side `signature_file !== null` test would keep rendering
 * a signature an Admin had deliberately withdrawn.
 *
 * Uploaded bytes come only from the audited download route, which answers
 * `Content-Disposition: attachment` and **401s a plain `<img src>`** — hence the
 * fetch-then-object-URL path through `useFileBlob`, which also owns the
 * `URL.revokeObjectURL` cleanup. That query is held with `staleTime: Infinity`
 * on a key outside every invalidation tree, because bytes are immutable for a
 * given file id and each download writes an audit event.
 *
 * **Hook count is fixed**, so this is safe to call unconditionally — including
 * for `null`, which every certificate signature slot starts as.
 */
export function useResolvedSignatureImage(
  ref: SignatureSourceRef | null | undefined,
): ResolvedSignature {
  const source = ref?.signature_source ?? "none";
  const fileId =
    source === "uploaded" ? (ref?.signature_file_id ?? null) : null;

  const { url, isLoading, isError } = useFileBlob(fileId);

  if (source === "uploaded") {
    return { url: url ?? "", isLoading, isError };
  }
  if (source === "url") {
    return {
      url: ref?.signature_image_url ?? "",
      isLoading: false,
      isError: false,
    };
  }
  return NOTHING;
}

/** The `Signatory` DTO flavour of {@link useResolvedSignatureImage}, for this module's own screens. */
export function useResolvedSignature(
  signatory: Signatory | null | undefined,
): ResolvedSignature {
  return useResolvedSignatureImage(
    signatory
      ? {
          signature_source: signatory.signature_source,
          signature_file_id: signatory.signature_file?.id ?? null,
          signature_image_url: signatory.signature_image_url,
        }
      : null,
  );
}
