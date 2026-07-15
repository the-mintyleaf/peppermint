import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";
import type { Assignment } from "../_shared";

/** `GET /api/v1/applicants/:id/assignments/` — assignment history, paginated. */
export async function fetchAssignments(
  applicantId: string,
  params?: QueryParams,
): Promise<{ data: Assignment[]; meta: { total: number } }> {
  const { data } = await api.get(
    `/api/v1/applicants/${applicantId}/assignments/`,
    { params: { page: params?.page, page_size: params?.pageSize } },
  );
  return { data: data.data, meta: { total: data.meta?.count ?? 0 } };
}

export interface AssignmentCreatePayload {
  assigned_to: string;
  application_case_id?: string;
  reason?: string;
}

/** `POST /api/v1/applicants/:id/assignments/` — assign to a counsellor. */
export async function createAssignment(
  applicantId: string,
  body: AssignmentCreatePayload,
): Promise<Assignment> {
  const { data } = await api.post<Assignment>(
    `/api/v1/applicants/${applicantId}/assignments/`,
    body,
  );
  return data;
}

/** `POST /api/v1/applicants/:id/assignments/:assignmentId/end/`. */
export async function endAssignment(
  applicantId: string,
  assignmentId: string,
  reason?: string,
): Promise<void> {
  await api.post(
    `/api/v1/applicants/${applicantId}/assignments/${assignmentId}/end/`,
    reason ? { reason } : {},
  );
}
