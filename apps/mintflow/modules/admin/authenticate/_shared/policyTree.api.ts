import api from "@/lib/api";
import type { PolicyApp, PolicyAppTree } from "./policyTree.types";

export async function fetchPolicyApps(): Promise<PolicyApp[]> {
  const { data } = await api.get<PolicyApp[]>("/api/v1/policy/apps/");
  return data;
}

export async function fetchPolicyPermissionTree(
  app?: string,
): Promise<PolicyAppTree[]> {
  const { data } = await api.get<PolicyAppTree[]>(
    "/api/v1/policy/permissions/tree/",
    { params: app ? { app } : undefined },
  );
  return data;
}
