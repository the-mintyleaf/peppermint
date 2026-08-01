"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@peppermint/ui";
import { downloadFileBlob } from "../uploadedFiles.api";

/**
 * Inline preview for image categories only (photograph, signature_image) —
 * there is no preview/thumbnail endpoint (§9), so the bytes must be fetched
 * and handed to the browser as an object URL, same as `downloadFile` but kept
 * alive for `<img>` rather than triggered as a one-off download.
 *
 * The fetch itself goes through `useQuery` (never `useEffect` for data
 * fetching). Creating the object URL is deliberately done inside `useEffect`
 * rather than `useMemo`: `URL.createObjectURL` allocates a real browser
 * resource, and only an effect's cleanup is *guaranteed* to run before the
 * next one fires (including React 19 StrictMode's dev-only double-invoke) —
 * a value computed in `useMemo` can be discarded by React without its
 * "cleanup" ever running, since `useMemo` has no cleanup callback at all,
 * which leaks the object URL. This is the "synchronize with an external
 * system" effect case the lint rule's own message carves out, so the
 * synchronous `setState` it otherwise warns about is intentional here.
 * Bytes for a given file version never change once uploaded, so the query
 * never goes stale.
 */
export function useFileBlob(fileId: string | null, enabled = true) {
  const query = useQuery({
    // Deliberately OUTSIDE `fileQueryKeys.all`, unlike every other query in this
    // module. Each mutation here invalidates that whole tree (see
    // `uploadedFiles.hooks.ts`), which would match the blob queries too and
    // re-download every mounted preview whenever any unrelated file was
    // uploaded, edited or archived — and each of those downloads writes an
    // audit event, the only audited read in the API. Bytes are immutable for a
    // given file id (a replacement is a new id, so it lands on a new key), so
    // there is no invalidation this query should ever answer.
    queryKey: ["files.file-bytes", fileId ?? "none"],
    queryFn: () => downloadFileBlob(fileId as string),
    enabled: enabled && fileId !== null,
    staleTime: Infinity,
  });

  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above: synchronizing a browser resource (object URL) with the resolved query data, not mirroring React state.
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(query.data);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [query.data]);

  return { url, isLoading: query.isLoading, isError: query.isError };
}
