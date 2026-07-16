"use client";

import { useRef } from "react";
import { useQuery } from "@peppermint/ui";
import { documentsApi } from "../documents.api";
import { documentQueryKeys } from "../documents.queryKeys";
import type { Signature } from "../documents.types";

/**
 * Active signatories with their private images resolved to object URLs (the image endpoint is
 * auth-gated, so a plain `<img src>` to the API URL would 401). Revocation is tied to the
 * query lifecycle (prior URLs are revoked when the queryFn re-runs), not component unmount, so
 * cached URLs stay valid across remounts within `staleTime`.
 */
export function useSignatures() {
  const objectUrlsRef = useRef<string[]>([]);

  const query = useQuery({
    queryKey: documentQueryKeys.signatures(),
    queryFn: async (): Promise<Signature[]> => {
      const signatures = await documentsApi.listSignatures(true);
      // Mint new URLs into a local list first; only after the fetch fully succeeds do we swap
      // the ref and revoke the previous URLs. A failed refetch therefore never leaves the
      // still-cached previous data pointing at revoked URLs.
      const minted: string[] = [];
      const resolved = await Promise.all(
        signatures.map(async (sig) => {
          if (!sig.has_image) return sig;
          try {
            const blob = await documentsApi.fetchSignatureImageBlob(sig.id);
            const url = URL.createObjectURL(blob);
            minted.push(url);
            return { ...sig, signature_image: url };
          } catch {
            return sig;
          }
        }),
      );
      const previous = objectUrlsRef.current;
      objectUrlsRef.current = minted;
      previous.forEach((url) => URL.revokeObjectURL(url));
      return resolved;
    },
    staleTime: 5 * 60 * 1000,
  });

  return query;
}
