import api from "@/lib/api";
import type {
  OrganizationOption,
  OrganizationUnitOption,
} from "./organizationScope.types";

interface ListResponse<T> {
  data: T[];
  meta: { count: number };
}

export async function fetchOrganizations(): Promise<OrganizationOption[]> {
  const { data } = await api.get<ListResponse<OrganizationOption>>(
    "/api/v1/organization/organizations/",
  );
  return data.data;
}

export async function fetchOrganizationUnits(
  organizationId: string,
): Promise<OrganizationUnitOption[]> {
  const { data } = await api.get<ListResponse<OrganizationUnitOption>>(
    `/api/v1/organization/organizations/${organizationId}/units/`,
  );
  return data.data;
}
