"use client";

import { useFileBlob } from "@/modules/admin/uploaded-files";
import type { Signatory } from "../signatures.types";

export interface ResolvedSignature {
  /** A URL an `<img>` can actually use, or `""` when there is nothing to render. */
  url: string;
  /** True only while uploaded bytes are still in flight — a URL source resolves synchronously. */
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
 * Turns a signatory into something renderable, branching on **`signature_source`
 * and nothing else** — the one rule the contract is emphatic about (§3).
 * `signature_file` is `null` in three different situations (never uploaded,
 * archived, superseded) and they are indistinguishable from the payload, so a
 * client-side `signature_file !== null` test would keep rendering a signature an
 * Admin had deliberately withdrawn.
 *
 * Uploaded bytes come only from the audited download route, which answers
 * `Content-Disposition: attachment` and **401s a plain `<img src>`** — hence the
 * fetch-then-object-URL path through `useFileBlob`, which also owns the
 * `URL.revokeObjectURL` cleanup. That query is held with `staleTime: Infinity`
 * on a key outside every invalidation tree, because bytes are immutable for a
 * given file id and each download writes an audit event.
 *
 * **Hook count is fixed**, so this is safe to call unconditionally — including
 * for a `null` signatory, which every certificate slot starts as.
 */
export function useResolvedSignature(
  signatory: Signatory | null | undefined,
): ResolvedSignature {
  const source = signatory?.signature_source ?? "none";
  const fileId =
    source === "uploaded" ? (signatory?.signature_file?.id ?? null) : null;

  const { url, isLoading, isError } = useFileBlob(fileId);

  if (source === "uploaded") {
    return { url: url ?? "", isLoading, isError };
  }
  if (source === "url") {
    return {
      url: signatory?.signature_image_url ?? "",
      isLoading: false,
      isError: false,
    };
  }
  return NOTHING;
}
