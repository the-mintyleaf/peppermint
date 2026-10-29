"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@peppermint/ui";
import { fileBytesKey } from "../../useFileBlob";
import { downloadFileBlob } from "../../../uploadedFiles.api";
import type { FilePreview } from "./FilePreviewModal.types";

/**
 * Bytes for the in-app viewer. Only mounted once the user has asked to view
 * the file, so the audited download happens on that click and never before.
 *
 * Shares `useFileBlob`'s cache key (bytes are immutable per id), but with
 * `retry: false`: each attempt writes an audit event, and the viewer offers
 * an explicit Retry instead — hidden entirely for
 * `UPLOADED_FILES_FILE_BYTES_MISSING`, which no retry can fix.
 *
 * The object URL is created in an effect for the same reason `useFileBlob`
 * gives (only an effect cleanup is guaranteed to revoke it), and re-typed with
 * `mimeType` so the `<iframe>`/`<img>` render exactly the type we decided on.
 * Unmounting the modal revokes it.
 */
export function useFilePreview(fileId: string, mimeType: string): FilePreview {
  const query = useQuery({
    queryKey: fileBytesKey(fileId),
    queryFn: () => downloadFileBlob(fileId),
    staleTime: Infinity,
    retry: false,
  });

  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizing a browser resource (object URL) with the resolved query data; see `useFileBlob`.
      setUrl(null);
      return;
    }
    const typed =
      query.data.type === mimeType
        ? query.data
        : new Blob([query.data], { type: mimeType });
    const objectUrl = URL.createObjectURL(typed);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [query.data, mimeType]);

  return {
    url,
    blob: query.data ?? null,
    isError: query.isError,
    error: query.error,
    isRetrying: query.isFetching,
    retry: () => {
      void query.refetch();
    },
  };
}
