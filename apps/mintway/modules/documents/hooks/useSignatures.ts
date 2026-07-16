"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@peppermint/ui";
import { documentsApi } from "../documents.api";
import { documentQueryKeys } from "../documents.queryKeys";
import type { Signature } from "../documents.types";

/**
 * Active signatories with their private images resolved to object URLs (the image endpoint is
 * auth-gated, so a plain `<img src>` to the API URL would 401). Object URLs are revoked on
 * unmount / when the set changes to avoid leaks.
 */
export function useSignatures() {
  const objectUrlsRef = useRef<string[]>([]);

  const query = useQuery({
    queryKey: documentQueryKeys.signatures(),
    queryFn: async (): Promise<Signature[]> => {
      const signatures = await documentsApi.listSignatures(true);
      const resolved = await Promise.all(
        signatures.map(async (sig) => {
          if (!sig.has_image) return sig;
          try {
            const blob = await documentsApi.fetchSignatureImageBlob(sig.id);
            const url = URL.createObjectURL(blob);
            objectUrlsRef.current.push(url);
            return { ...sig, signature_image: url };
          } catch {
            return sig;
          }
        }),
      );
      return resolved;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, []);

  return query;
}
