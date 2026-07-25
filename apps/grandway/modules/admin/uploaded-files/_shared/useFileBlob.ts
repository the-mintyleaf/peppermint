"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@peppermint/ui";
import { downloadFileBlob } from "../uploadedFiles.api";
import { fileQueryKeys } from "../uploadedFiles.queryKeys";

/**
 * Inline preview for image categories only (photograph, signature_image) —
 * there is no preview/thumbnail endpoint (§9), so the bytes must be fetched
 * and handed to the browser as an object URL, same as `downloadFile` but kept
 * alive for `<img>` rather than triggered as a one-off download.
 *
 * The fetch itself goes through `useQuery` (never `useEffect` for data
 * fetching). The object URL is derived from the resolved blob via `useMemo`
 * rather than mirrored into state inside an effect (which would cascade an
 * extra render); `useEffect` is used only for its cleanup function, revoking
 * the previous URL once a new one is created or the component unmounts.
 * Bytes for a given file version never change once uploaded, so the query
 * never goes stale.
 */
export function useFileBlob(fileId: string | null, enabled = true) {
  const query = useQuery({
    queryKey: fileId
      ? [...fileQueryKeys.detail(fileId), "blob"]
      : ["files.files", "detail", "none", "blob"],
    queryFn: () => downloadFileBlob(fileId as string),
    enabled: enabled && fileId !== null,
    staleTime: Infinity,
  });

  const url = useMemo(
    () => (query.data ? URL.createObjectURL(query.data) : null),
    [query.data],
  );

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return { url, isLoading: query.isLoading, isError: query.isError };
}
