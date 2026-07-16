import api from "@/lib/api";
import type { AccessCheckRequest, AccessDecision } from "./access-tester.types";

export async function checkAccess(
  payload: AccessCheckRequest,
): Promise<AccessDecision> {
  const { data } = await api.post<AccessDecision>(
    "/api/v1/permissions/check/",
    payload,
  );
  return data;
}

export async function explainAccess(
  payload: AccessCheckRequest,
): Promise<AccessDecision> {
  const { data } = await api.post<AccessDecision>(
    "/api/v1/permissions/explain/",
    payload,
  );
  return data;
}
