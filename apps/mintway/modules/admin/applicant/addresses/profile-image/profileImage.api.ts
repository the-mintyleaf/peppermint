import type { AxiosError } from "axios";

import api from "@/lib/api";

/**
 * `GET /api/v1/applicants/:id/profile-image/` — streams the private photo bytes (no
 * public URL). Fetched as a Blob through the authed instance (the bearer header can't
 * ride on a plain `<img src>`). A 404 means "no photo set" → `null`, not an error.
 */
export async function fetchProfileImageBlob(
  applicantId: string,
): Promise<Blob | null> {
  try {
    const res = await api.get(
      `/api/v1/applicants/${applicantId}/profile-image/`,
      { responseType: "blob" },
    );
    return res.data as Blob;
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return null;
    throw error;
  }
}

export interface ProfileImageUploadResult {
  media_id: string;
  checksum: string;
  mime_type: string;
}

/** `POST /api/v1/applicants/:id/profile-image/` — multipart `file` (≤5 MB image). */
export async function uploadProfileImage(
  applicantId: string,
  file: File,
): Promise<ProfileImageUploadResult> {
  const form = new FormData();
  form.append("file", file);
  // Axios's browser adapter strips the instance's default JSON Content-Type for a
  // FormData body and sets multipart with the boundary itself.
  const { data } = await api.post<ProfileImageUploadResult>(
    `/api/v1/applicants/${applicantId}/profile-image/`,
    form,
  );
  return data;
}

export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
