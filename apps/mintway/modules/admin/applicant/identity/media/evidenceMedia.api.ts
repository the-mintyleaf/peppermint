import type { AxiosError } from "axios";
import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";
import type { MediaItem } from "../../_shared";

/** `GET /api/v1/applicants/:id/media/` — evidence media metadata (§7), paginated. */
export async function fetchEvidenceMedia(
  applicantId: string,
  params?: QueryParams,
): Promise<{
  data: MediaItem[];
  meta: { total: number } & Record<string, unknown>;
}> {
  const { data } = await api.get(`/api/v1/applicants/${applicantId}/media/`, {
    params: {
      page: params?.page,
      page_size: params?.pageSize,
      ...params?.filters,
    },
  });
  return {
    data: data.data,
    meta: { ...data.meta, total: data.meta?.count ?? 0 },
  };
}

/** `POST /api/v1/applicants/:id/media/` — multipart `category` + `file` (image/PDF). */
export async function uploadEvidenceMedia(
  applicantId: string,
  category: string,
  file: File,
): Promise<MediaItem> {
  const form = new FormData();
  form.append("category", category);
  form.append("file", file);
  const { data } = await api.post<MediaItem>(
    `/api/v1/applicants/${applicantId}/media/`,
    form,
  );
  return data;
}

/** `DELETE /api/v1/applicants/:id/media/:mediaId/` — soft archive (file retained). */
export async function deleteEvidenceMedia(
  applicantId: string,
  mediaId: string,
): Promise<void> {
  await api.delete(`/api/v1/applicants/${applicantId}/media/${mediaId}/`);
}

/** `GET /api/v1/applicants/:id/media/:mediaId/` — stream the bytes as a Blob. */
export async function fetchEvidenceMediaBlob(
  applicantId: string,
  mediaId: string,
): Promise<Blob | null> {
  try {
    const res = await api.get(
      `/api/v1/applicants/${applicantId}/media/${mediaId}/`,
      { responseType: "blob" },
    );
    return res.data as Blob;
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return null;
    throw error;
  }
}

export const EVIDENCE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const EVIDENCE_PDF_MAX_BYTES = 10 * 1024 * 1024;
export const EVIDENCE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const EVIDENCE_PDF_TYPE = "application/pdf";
