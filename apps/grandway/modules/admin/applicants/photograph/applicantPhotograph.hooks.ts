"use client";

import { useMemo } from "react";
import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import {
  listFiles,
  replaceFile,
  uploadFile,
} from "@/modules/admin/uploaded-files/uploadedFiles.api";
import { fileQueryKeys } from "@/modules/admin/uploaded-files/uploadedFiles.queryKeys";
import type { UploadedFile } from "@/modules/admin/uploaded-files/uploadedFiles.types";
import { useFileBlob } from "@/modules/admin/uploaded-files/_shared/useFileBlob";
import { pickCurrentPhotograph } from "./applicantPhotograph.utils";

/**
 * Its own key rather than `filesListKey({ applicant }, false)`: this is a
 * category-narrowed request, so sharing the panel's key would let one cache
 * entry hold two different result sets depending on which mounted first.
 * Nested under `fileQueryKeys.all`, so every file mutation's broad invalidate
 * (`uploadedFiles.hooks.ts`) refreshes the photo too — including an archive
 * performed from the Files panel, which is how a photograph gets removed.
 */
export function applicantPhotographKey(applicantId: string) {
  return [...fileQueryKeys.all, "applicant-photograph", applicantId] as const;
}

interface ApplicantPhotographResult {
  /** Object URL for `<img src>`, or `null` while loading / when there is none. */
  url: string | null;
  /** The file row behind `url` — `null` when the applicant has no photograph. */
  file: UploadedFile | null;
  /** True while either the lookup or the byte fetch is in flight. */
  isLoading: boolean;
  /** True once the lookup settled and the applicant genuinely has no photograph. */
  isMissing: boolean;
  /** The lookup or the byte fetch failed — distinct from "there isn't one". */
  isError: boolean;
  /** Re-runs the lookup; the byte fetch follows from it. Backs the retry affordance. */
  refetch: () => void;
}

/**
 * The applicant's current photograph, resolved to a displayable object URL.
 *
 * Two requests, unavoidably: the file rows carry no URL and no thumbnail
 * (`uploaded-files/INTEGRATION.md` §3), so the row must be found first and its
 * bytes fetched second through the authenticated download endpoint. **Every
 * byte fetch writes an audit event server-side** — the only audited read in the
 * API — so this is cached with `staleTime: Infinity` (bytes for a given file id
 * never change; a replacement is a new id) and callers should mount it once per
 * applicant per screen, not once per element.
 */
export function useApplicantPhotograph(
  applicantId: string | null | undefined,
  enabled = true,
): ApplicantPhotographResult {
  const isEnabled = enabled && Boolean(applicantId);

  const lookup = useQuery({
    queryKey: applicantPhotographKey(applicantId ?? "none"),
    queryFn: () =>
      listFiles({
        page: 1,
        pageSize: 100,
        search: "",
        sort: [],
        filters: {
          applicant: applicantId as string,
          category: "photograph",
          is_archived: false,
          is_current: true,
        },
      }),
    enabled: isEnabled,
    staleTime: Infinity,
  });

  const file = useMemo(
    () => pickCurrentPhotograph(lookup.data?.data),
    [lookup.data],
  );

  const blob = useFileBlob(file?.id ?? null, isEnabled);

  return {
    url: blob.url,
    file,
    isLoading: lookup.isLoading || (file !== null && blob.isLoading),
    isMissing: isEnabled && lookup.isSuccess && file === null,
    isError: lookup.isError || blob.isError,
    refetch: lookup.refetch,
  };
}

/**
 * Set the applicant's photograph — upload when there is none, **replace** when
 * there already is one.
 *
 * Replacing rather than uploading a second row is what keeps "the applicant's
 * photograph" singular. The backend marks no file as primary, so two uploads
 * would leave two equally-current photographs and the newest-wins tie-break
 * would silently decide which one every CV renders. `replace` instead
 * supersedes the old row into the version chain: still readable, still
 * downloadable, no longer current (§3).
 *
 * The successor inherits owner and category from its predecessor, which is why
 * the replace branch sends neither (§7 — sending them there has no effect).
 */
export function useSaveApplicantPhotograph(
  applicantId: string,
  currentPhotographId: string | null,
) {
  return useAppMutation<UploadedFile, File>({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      if (currentPhotographId) {
        return replaceFile(currentPhotographId, formData);
      }
      formData.append("applicant", applicantId);
      formData.append("category", "photograph");
      return uploadFile(formData);
    },
    successMessage: "Photograph updated.",
    errorTitle: "Couldn't save photograph",
    invalidateKeys: [fileQueryKeys.all],
  });
}
