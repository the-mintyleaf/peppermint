"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@peppermint/ui";

import { profileImageKeys } from "../../_shared";
import { fetchProfileImageBlob } from "./profileImage.api";

/**
 * Fetch the applicant's private profile photo and expose it as an object URL.
 *
 * The image is streamed as a Blob (the bearer header can't ride on a plain `<img src>`),
 * then rendered via an object URL that is revoked on change/unmount. A missing photo
 * (404) resolves to `null` — not an error — so callers just render a fallback.
 */
export function useProfileImageUrl(applicantId: string) {
  const { data: blob, isLoading } = useQuery({
    queryKey: profileImageKeys.detail(applicantId),
    queryFn: () => fetchProfileImageBlob(applicantId),
    enabled: Boolean(applicantId),
    retry: false,
  });

  // Object-URL lifecycle is a genuine external-system sync: create it from the streamed
  // blob and revoke the exact URL on change/unmount. Creating it in render (useMemo)
  // would leak on aborted StrictMode renders.
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = blob ? URL.createObjectURL(blob) : null;
    // Legitimate external-system sync (blob → object URL); the rule's cascading-render
    // concern doesn't apply — this runs once per blob change and revokes on cleanup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [blob]);

  return { url, isLoading };
}
