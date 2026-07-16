import {
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import type { QueryClient } from "@peppermint/ui";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { organizationQueryKeys } from "../_shared/organization.queryKeys";
import type {
  UnitMutationResult,
  UnitTreeNodeFlat,
} from "../_shared/organization.types";
import { useStructureData } from "../_shared/structure-data";
import type {
  CreateUnitPayload,
  DeactivateUnitPayload,
  MoveUnitPayload,
  UpdateUnitPayload,
} from "../_shared/structure-data";
import { organizationsQueryKeys } from "../organizations/organizations.queryKeys";
import { patchNodeFieldsInList, patchParentsInList } from "./Structure.utils";

export function useOrganizationRoot(organizationId: string) {
  const { dataSource } = useStructureData();
  return useQuery({
    queryKey: organizationsQueryKeys.detail(organizationId),
    queryFn: () => dataSource.fetchOrganization(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useUnitRoots(organizationId: string) {
  const { dataSource } = useStructureData();
  return useQuery({
    queryKey: organizationQueryKeys.unitRoots(organizationId),
    queryFn: () => dataSource.fetchUnitRoots(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useUnitDetail(unitId: string | null) {
  const { dataSource } = useStructureData();
  return useQuery({
    queryKey: organizationQueryKeys.unitDetail(unitId ?? ""),
    queryFn: () => dataSource.fetchUnitDetail(unitId as string),
    enabled: Boolean(unitId),
  });
}

export function useUnitAncestors(unitId: string | null) {
  const { dataSource } = useStructureData();
  return useQuery({
    queryKey: organizationQueryKeys.unitAncestors(unitId ?? ""),
    queryFn: () => dataSource.fetchUnitAncestors(unitId as string),
    enabled: Boolean(unitId),
  });
}

export function useUnitDescendants(unitId: string | null) {
  const { dataSource } = useStructureData();
  return useQuery({
    queryKey: organizationQueryKeys.unitDescendants(unitId ?? ""),
    queryFn: () => dataSource.fetchUnitDescendants(unitId as string),
    enabled: Boolean(unitId),
  });
}

export function useUnitSearch(organizationId: string, query: string) {
  const { dataSource } = useStructureData();
  const trimmed = query.trim();
  return useQuery({
    queryKey: organizationQueryKeys.unitSearch(organizationId, trimmed),
    queryFn: () => dataSource.searchUnits(organizationId, trimmed),
    enabled: Boolean(organizationId) && trimmed.length >= 2,
    staleTime: 30_000,
  });
}

function useInvalidateStructure(organizationId: string) {
  const queryClient = useQueryClient();
  return () => {
    // Fallback path (mutation response lacks the T5 shape): invalidate the root
    // list, every lazily-loaded child branch, and the flat list in one pass — a
    // mutation can reshape any loaded part of the tree.
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

function isOrgUnitListKey(key: unknown, organizationId: string): boolean {
  return (
    Array.isArray(key) &&
    key[0] === "organizations" &&
    key[1] === organizationId &&
    (key[2] === "unit-roots" || key[2] === "unit-children")
  );
}

/**
 * Apply a mutation's affected node + parents to the cache directly (T5). Field
 * changes (name/status/counts) patch in place across every cached list — no
 * refetch, no flash. `structural` create/move additionally refetch only the
 * touched parent branches + roots so the node lands in the right place, instead
 * of invalidating the whole tree.
 */
function applyUnitMutationResult(
  queryClient: QueryClient,
  organizationId: string,
  result: UnitMutationResult,
  { structural }: { structural: boolean },
) {
  const { node, affected_parents } = result;

  queryClient.setQueriesData<UnitTreeNodeFlat[]>(
    { predicate: (q) => isOrgUnitListKey(q.queryKey, organizationId) },
    (old) => patchNodeFieldsInList(old, node),
  );
  queryClient.setQueriesData<UnitTreeNodeFlat[]>(
    { predicate: (q) => isOrgUnitListKey(q.queryKey, organizationId) },
    (old) => patchParentsInList(old, affected_parents),
  );

  void queryClient.invalidateQueries({
    queryKey: organizationQueryKeys.unitDetail(node.id),
  });
  // The flat unit list backs UnitPickerSelect (move/delegation/position/member
  // forms); a rename/move/deactivate changes labels/paths there too.
  void queryClient.invalidateQueries({
    queryKey: organizationQueryKeys.unitsFlat(organizationId),
  });

  if (!structural) return;

  // Refetch only the branches whose child set changed (new parent + every
  // affected parent, which for `move` includes the old parent) plus the root
  // list — scoped, not the whole tree.
  const branchIds = new Set<string>();
  if (node.parent_id) branchIds.add(node.parent_id);
  for (const parent of affected_parents) branchIds.add(parent.id);
  for (const branchId of branchIds) {
    void queryClient.invalidateQueries({
      queryKey: organizationQueryKeys.unitChildren(organizationId, branchId),
    });
  }
  void queryClient.invalidateQueries({
    queryKey: organizationQueryKeys.unitRoots(organizationId),
  });
}

export function useCreateUnit(organizationId: string) {
  const { dataSource } = useStructureData();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateStructure(organizationId);
  return useMutation({
    mutationFn: (payload: CreateUnitPayload) =>
      dataSource.createUnit(organizationId, payload),
    onSuccess: (result) => {
      if (result?.node) {
        applyUnitMutationResult(queryClient, organizationId, result, {
          structural: true,
        });
      } else {
        invalidate();
      }
      notifications.show({
        color: "green",
        title: "Unit created",
        message: `"${result?.node?.name_np ?? "The unit"}" was added to the structure.`,
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
  const { dataSource } = useStructureData();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateStructure(organizationId);
  return useMutation({
    mutationFn: ({
      unitId,
      payload,
    }: {
      unitId: string;
      payload: UpdateUnitPayload;
    }) => dataSource.updateUnit(unitId, payload),
    onSuccess: (result) => {
      if (result?.node) {
        applyUnitMutationResult(queryClient, organizationId, result, {
          structural: false,
        });
      } else {
        invalidate();
      }
      notifications.show({
        color: "green",
        title: "Unit updated",
        message: `"${result?.node?.name_np ?? "The unit"}" was updated.`,
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
  const { dataSource } = useStructureData();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateStructure(organizationId);
  return useMutation({
    mutationFn: ({
      unitId,
      payload,
    }: {
      unitId: string;
      payload: MoveUnitPayload;
    }) => dataSource.moveUnit(unitId, payload),
    onSuccess: (result) => {
      if (result?.node) {
        applyUnitMutationResult(queryClient, organizationId, result, {
          structural: true,
        });
        void queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.unitAncestors(result.node.id),
        });
        void queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.unitDescendants(result.node.id),
        });
      } else {
        invalidate();
      }
      notifications.show({
        color: "green",
        title: "Unit moved",
        message: `"${result?.node?.name_np ?? "The unit"}" was moved.`,
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
  const { dataSource } = useStructureData();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateStructure(organizationId);
  return useMutation({
    mutationFn: ({
      unitId,
      payload,
    }: {
      unitId: string;
      payload: DeactivateUnitPayload;
    }) => dataSource.deactivateUnit(unitId, payload),
    onSuccess: (result) => {
      if (result?.node) {
        // Non-structural: the API rejects deactivating a unit that still has
        // active children (ORGANIZATION_UNIT_HAS_ACTIVE_CHILDREN), so there is no
        // cascade to refetch — only this node's status changes.
        applyUnitMutationResult(queryClient, organizationId, result, {
          structural: false,
        });
      } else {
        invalidate();
      }
      notifications.show({
        color: "green",
        title: "Unit deactivated",
        message: `"${result?.node?.name_np ?? "The unit"}" is no longer operational.`,
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
