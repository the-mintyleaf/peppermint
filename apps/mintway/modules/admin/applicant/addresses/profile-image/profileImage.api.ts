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
  // The shared instance defaults Content-Type to application/json; axios then
  // JSON-stringifies FormData (dropping the file) unless the content type is not
  // JSON. Override it so axios passes the FormData through and the browser sets
  // multipart/form-data with the correct boundary.
  const { data } = await api.post<ProfileImageUploadResult>(
    `/api/v1/applicants/${applicantId}/profile-image/`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
