import type { AxiosError } from "axios";

import api from "@/lib/api";
import type { InterestProfile } from "../../_shared";

const path = (applicantId: string) =>
  `/api/v1/applicants/${applicantId}/interest-profile/`;

/** `GET …/interest-profile/` — the OneToOne profile, or `null` when unset (404). */
export async function getInterestProfile(
  applicantId: string,
): Promise<InterestProfile | null> {
  try {
    const { data } = await api.get<InterestProfile>(path(applicantId));
    return data;
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return null;
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
