import type { AxiosError } from "axios";

import api from "@/lib/api";
import { getApiError } from "@/lib/authErrorMessages";
import type { InterestProfile } from "../../_shared";

const path = (applicantId: string) =>
  `/api/v1/applicants/${applicantId}/interest-profile/`;

/**
 * `GET …/interest-profile/` — the OneToOne profile, or `null` when the profile is unset
 * (`APPLICANT_CHILD_NOT_FOUND`). A `APPLICANT_NOT_FOUND` (bad applicant) is re-thrown so
 * the caller doesn't mistake it for "no profile" and offer a create form.
 */
export async function getInterestProfile(
  applicantId: string,
): Promise<InterestProfile | null> {
  try {
    const { data } = await api.get<InterestProfile>(path(applicantId));
    return data;
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (
      status === 404 &&
      getApiError(error).code === "APPLICANT_CHILD_NOT_FOUND"
    ) {
      return null;
    }
    throw error;
  }
}

export async function createInterestProfile(
  applicantId: string,
  body: Record<string, unknown>,
): Promise<InterestProfile> {
  const { data } = await api.post<InterestProfile>(path(applicantId), body);
  return data;
}

export async function updateInterestProfile(
  applicantId: string,
  body: Record<string, unknown>,
): Promise<InterestProfile> {
  const { data } = await api.patch<InterestProfile>(path(applicantId), body);
  return data;
}

export async function deleteInterestProfile(
  applicantId: string,
): Promise<void> {
  await api.delete(path(applicantId));
}
