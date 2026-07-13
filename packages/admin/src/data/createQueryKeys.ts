// Typed query-key factory. Replaces the stringly-typed `"resource.list"` keys and
// the dual `list()` (string) / `listKey()` (array) forms modules hand-maintained —
// and the `.split(".")` hack used to feed React Query. Every key is an array, which
// is what React Query's invalidateQueries/queryKey want.

export interface ResourceQueryKeys {
  /** Root key for the resource — invalidates everything under it. */
  all: readonly [string];
  /** All list queries for the resource. */
  lists: () => readonly [string, "list"];
  /** A specific list query, optionally parameterized (page/filters/etc.). */
  list: (params?: unknown) => readonly unknown[];
  /** All detail queries for the resource. */
  details: () => readonly [string, "detail"];
  /** A specific record's detail query. */
  detail: (id: string | number) => readonly unknown[];
}

/**
 * Build a set of stable, array-form query keys for a resource.
 *
 * @example
 * const grantKeys = createQueryKeys("permissions.grants");
 * useQuery({ queryKey: grantKeys.list(), queryFn: ... });
 * queryClient.invalidateQueries({ queryKey: grantKeys.lists() });
 */
export function createQueryKeys(resource: string): ResourceQueryKeys {
  return {
    all: [resource] as const,
    lists: () => [resource, "list"] as const,
    list: (params?: unknown) =>
      params === undefined
        ? ([resource, "list"] as const)
        : ([resource, "list", params] as const),
    details: () => [resource, "detail"] as const,
    detail: (id: string | number) => [resource, "detail", id] as const,
  };
}
