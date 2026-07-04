import { useQuery } from "@peppermint/ui";
import { fetchPolicyPermissionTree } from "../policyTree.api";
import { policyTreeQueryKeys } from "../policyTree.queryKeys";

export function usePermissionTree(appFilter?: string) {
  return useQuery({
    queryKey: policyTreeQueryKeys.tree(appFilter),
    queryFn: () => fetchPolicyPermissionTree(appFilter),
    staleTime: 60_000,
  });
}

export interface GroupedPermissionOption {
  group: string;
  items: { value: string; label: string }[];
}

export function toGroupedOptions(
  tree: ReturnType<typeof usePermissionTree>["data"],
): GroupedPermissionOption[] {
  if (!tree) return [];
  return tree.flatMap((appTree) =>
    appTree.groups.map((group) => ({
      group: `${appTree.app} — ${group.label}`,
      items: group.permissions.map((permission) => ({
        value: permission.key,
        label: `${permission.label} (${permission.key})`,
      })),
    })),
  );
}
