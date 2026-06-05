"use client";

import { useQuery } from "@zetsel/ui";
import { documentsApi } from "../documents.api";
import { documentQueryKeys } from "../documents.queryKeys";

export function usePrintLogs(documentId: string | null) {
  return useQuery({
    queryKey: documentQueryKeys.printLogs(documentId ?? ""),
    queryFn: () => documentsApi.getPrintLogs(documentId!),
    enabled: !!documentId,
  });
}
