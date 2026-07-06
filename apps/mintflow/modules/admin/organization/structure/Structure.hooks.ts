import {
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { fetchUnitRoots } from "../_shared/organization.api";
import { organizationQueryKeys } from "../_shared/organization.queryKeys";
import { fetchOrganization } from "../organizations/organizations.api";
import { organizationsQueryKeys } from "../organizations/organizations.queryKeys";
import {
  createUnit,
  deactivateUnit,
  fetchUnitAncestors,
  fetchUnitDescendants,
  fetchUnitDetail,
  moveUnit,
  updateUnit,
} from "./Structure.api";
import type {
  CreateUnitPayload,
  DeactivateUnitPayload,
  MoveUnitPayload,
  UpdateUnitPayload,
} from "./Structure.api";

export function useOrganizationRoot(organizationId: string) {
  return useQuery({
    queryKey: organizationsQueryKeys.detail(organizationId),
    queryFn: () => fetchOrganization(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useUnitRoots(organizationId: string) {
  return useQuery({
    queryKey: organizationQueryKeys.unitRoots(organizationId),
    queryFn: () => fetchUnitRoots(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useUnitDetail(unitId: string | null) {
  return useQuery({
    queryKey: organizationQueryKeys.unitDetail(unitId ?? ""),
    queryFn: () => fetchUnitDetail(unitId as string),
    enabled: Boolean(unitId),
  });
}

export function useUnitAncestors(unitId: string | null) {
  return useQuery({
    queryKey: organizationQueryKeys.unitAncestors(unitId ?? ""),
    queryFn: () => fetchUnitAncestors(unitId as string),
    enabled: Boolean(unitId),
  });
}

export function useUnitDescendants(unitId: string | null) {
  return useQuery({
    queryKey: organizationQueryKeys.unitDescendants(unitId ?? ""),
    queryFn: () => fetchUnitDescendants(unitId as string),
    enabled: Boolean(unitId),
  });
}

function useInvalidateStructure(organizationId: string) {
  const queryClient = useQueryClient();
  return () => {
    // Invalidate the root list, every lazily-loaded child branch, and the flat
    // list in one pass — a mutation can reshape any loaded part of the tree.
    void queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return (
          Array.isArray(key) &&
          key[0] === "organizations" &&
          key[1] === organizationId &&
          (key[2] === "unit-roots" ||
            key[2] === "unit-children" ||
            key[2] === "units-flat")
        );
      },
    });
  };
}

export function useCreateUnit(organizationId: string) {
  const invalidate = useInvalidateStructure(organizationId);
  return useMutation({
    mutationFn: (payload: CreateUnitPayload) =>
      createUnit(organizationId, payload),
    onSuccess: (unit) => {
      invalidate();
      notifications.show({
        color: "green",
        title: "Unit created",
        message: `"${unit.name_np}" was added to the structure.`,
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't create unit",
        message: getApiErrorMessage(error),
      });
    },
  });
}

export function useUpdateUnit(organizationId: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateStructure(organizationId);
  return useMutation({
    mutationFn: ({
      unitId,
      payload,
    }: {
      unitId: string;
      payload: UpdateUnitPayload;
    }) => updateUnit(unitId, payload),
    onSuccess: (unit) => {
      invalidate();
      void queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.unitDetail(unit.id),
      });
      notifications.show({
        color: "green",
        title: "Unit updated",
        message: `"${unit.name_np}" was updated.`,
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't update unit",
        message: getApiErrorMessage(error),
      });
    },
  });
}

export function useMoveUnit(organizationId: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateStructure(organizationId);
  return useMutation({
    mutationFn: ({
      unitId,
      payload,
    }: {
      unitId: string;
      payload: MoveUnitPayload;
    }) => moveUnit(unitId, payload),
    onSuccess: (unit) => {
      invalidate();
      void queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.unitAncestors(unit.id),
      });
      void queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.unitDescendants(unit.id),
      });
      notifications.show({
        color: "green",
        title: "Unit moved",
        message: `"${unit.name_np}" was moved.`,
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't move unit",
        message: getApiErrorMessage(error),
      });
    },
  });
}

export function useDeactivateUnit(organizationId: string) {
  const invalidate = useInvalidateStructure(organizationId);
  return useMutation({
    mutationFn: ({
      unitId,
      payload,
    }: {
      unitId: string;
      payload: DeactivateUnitPayload;
    }) => deactivateUnit(unitId, payload),
    onSuccess: (unit) => {
      invalidate();
      notifications.show({
        color: "green",
        title: "Unit deactivated",
        message: `"${unit.name_np}" is no longer operational.`,
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't deactivate unit",
        message: getApiErrorMessage(error),
      });
    },
  });
}
