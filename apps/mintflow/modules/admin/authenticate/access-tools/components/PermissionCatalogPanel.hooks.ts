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

function filterTreeBySearch(
  tree: PolicyAppTree[] | undefined,
  search: string,
): PolicyAppTree[] {
  if (!tree) return [];
  const needle = search.trim().toLowerCase();
  if (!needle) return tree;

  return tree
    .map((appTree) => ({
      app: appTree.app,
      groups: appTree.groups
        .map((group) => ({
          ...group,
          permissions: group.permissions.filter((permission) =>
            matchesSearch(permission, needle),
          ),
        }))
        .filter((group) => group.permissions.length > 0),
    }))
    .filter((appTree) => appTree.groups.length > 0);
}

export function usePermissionCatalog() {
  const [appFilter, setAppFilter] = useState<string | null>(null);
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

  const filteredTree = useMemo(
    () => filterTreeBySearch(tree, search),
    [tree, search],
  );

  return {
    apps: apps ?? [],
    isLoadingApps,
    isLoadingTree,
    appFilter,
    setAppFilter,
    search,
    setSearch,
    tree: filteredTree,
  };
}
