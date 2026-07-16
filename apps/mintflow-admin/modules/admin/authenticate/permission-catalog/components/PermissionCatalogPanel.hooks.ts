import { useMemo, useState } from "react";
import { useQuery } from "@peppermint/ui";
import {
  fetchPolicyApps,
  fetchPolicyPermissionTree,
} from "@/modules/admin/authenticate/_shared/policyTree.api";
import { policyTreeQueryKeys } from "@/modules/admin/authenticate/_shared/policyTree.queryKeys";
import type {
  PolicyAppTree,
  PolicyPermission,
} from "@/modules/admin/authenticate/_shared/policyTree.types";

function matchesSearch(permission: PolicyPermission, needle: string): boolean {
  const haystack = `${permission.key} ${permission.label}`.toLowerCase();
  return haystack.includes(needle);
}

function filterTree(
  tree: PolicyAppTree[] | undefined,
  predicate: (permission: PolicyPermission) => boolean,
): PolicyAppTree[] {
  if (!tree) return [];

  return tree
    .map((appTree) => ({
      app: appTree.app,
      groups: appTree.groups
        .map((group) => ({
          ...group,
          permissions: group.permissions.filter(predicate),
        }))
        .filter((group) => group.permissions.length > 0),
    }))
    .filter((appTree) => appTree.groups.length > 0);
}

export function usePermissionCatalog() {
  const [appFilter, setAppFilter] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<string | null>(null);
  const [operationFilter, setOperationFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: apps, isLoading: isLoadingApps } = useQuery({
    queryKey: policyTreeQueryKeys.apps(),
    queryFn: fetchPolicyApps,
    staleTime: 60_000,
  });

  const { data: tree, isLoading: isLoadingTree } = useQuery({
    queryKey: policyTreeQueryKeys.tree(appFilter ?? undefined),
    queryFn: () => fetchPolicyPermissionTree(appFilter ?? undefined),
    staleTime: 30_000,
  });

  const operationOptions = useMemo(() => {
    const operations = new Set<string>();
    tree?.forEach((appTree) =>
      appTree.groups.forEach((group) =>
        group.permissions.forEach((permission) =>
          operations.add(permission.operation),
        ),
      ),
    );
    return Array.from(operations).sort();
  }, [tree]);

  const filteredTree = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return filterTree(tree, (permission) => {
      if (needle && !matchesSearch(permission, needle)) return false;
      if (riskFilter && permission.risk_level !== riskFilter) return false;
      if (operationFilter && permission.operation !== operationFilter)
        return false;
      return true;
    });
  }, [tree, search, riskFilter, operationFilter]);

  return {
    apps: apps ?? [],
    isLoadingApps,
    isLoadingTree,
    appFilter,
    setAppFilter,
    riskFilter,
    setRiskFilter,
    operationFilter,
    setOperationFilter,
    operationOptions,
    search,
    setSearch,
    tree: filteredTree,
  };
}
