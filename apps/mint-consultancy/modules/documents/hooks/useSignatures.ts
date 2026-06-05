"use client";

import { useQuery } from "@zetsel/ui";
import { documentsApi } from "../documents.api";
import { documentQueryKeys } from "../documents.queryKeys";

export function useSignatures() {
  return useQuery({
    queryKey: documentQueryKeys.signatures(),
    queryFn: documentsApi.fetchSignatures,
  });
}
