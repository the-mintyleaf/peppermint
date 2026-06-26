import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Node, Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import {
  createUnit,
  fetchUnitTree,
  type CreateUnitInput,
} from "./OrganizationTree.api";
import { orgTreeQueryKeys } from "./OrganizationTree.queryKeys";
import type { DepartmentData, OrgNodeData } from "./OrganizationTree.types";
import {
  createOrganization,
  updateOrganization,
} from "../organizations/organizations.api";
import type { Organization } from "../organizations/organizations.types";
import { createPerson } from "../people/people.api";
import type { CreatePersonPayload } from "../people/people.types";
import { createPosition as createPositionApi } from "../positions/positions.api";
import type { Position } from "../positions/positions.types";
import { createSite } from "../sites/sites.api";
import type { CreateSitePayload } from "../sites/sites.types";
import { createDelegation } from "../delegations/delegations.api";
import type { DelegationCreatePayload } from "../delegations/delegations.types";

export type OrgFlowNode = Node<OrgNodeData, string>;
export type OrgFlowEdge = Edge & { data?: { relationshipType?: string } };

interface UnitTreeItem {
  id: string;
  parent_id: string | null;
  name: string;
  code: string;
  unit_type: string;
  status: string;
  sort_order: number;
  children?: UnitTreeItem[];
}

function unitToFlowNode(unit: UnitTreeItem): OrgFlowNode {
  const data: DepartmentData = {
    nodeType: "department",
    name: unit.name,
    deptType: (unit.unit_type as DepartmentData["deptType"]) ?? "department",
    status: unit.status === "active" ? "active" : "inactive",
    peopleCount: 0,
    createdAt: undefined,
  };
  return {
    id: unit.id,
    type: "department",
    data,
    position: { x: 0, y: 0 },
  };
}

function unitToEdge(unit: UnitTreeItem): OrgFlowEdge | null {
  if (!unit.parent_id) return null;
  return {
    id: `e-${unit.parent_id}-${unit.id}`,
    source: unit.parent_id,
    target: unit.id,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
    style: { strokeWidth: 2, stroke: "#94a3b8" },
    data: { relationshipType: "contains" },
  };
}

function flattenTree(
  items: UnitTreeItem[],
  parentId: string | null = null,
): UnitTreeItem[] {
  return items.flatMap((item) => {
    const flat: UnitTreeItem = { ...item, parent_id: parentId };
    return [flat, ...flattenTree(item.children ?? [], item.id)];
  });
}

function buildFlowGraph(raw: { units: unknown[]; positions: unknown[] }): {
  nodes: OrgFlowNode[];
  edges: OrgFlowEdge[];
} {
  const units = flattenTree(raw.units as UnitTreeItem[]);
  const nodes = units.map(unitToFlowNode);
  const edges = units.map(unitToEdge).filter(Boolean) as OrgFlowEdge[];
  return { nodes, edges };
}

export function useOrganizationGraph(orgId: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: orgTreeQueryKeys.graph(orgId),
    queryFn: () => fetchUnitTree(orgId),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });

  const { nodes, edges } = useMemo(
    () => (data ? buildFlowGraph(data) : { nodes: [], edges: [] }),
    [data],
  );

  return { nodes, edges, isLoading, isError };
}

export function useCreateUnit(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateUnitInput, "organization">) =>
      createUnit({ ...input, organization: orgId }),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: orgTreeQueryKeys.graph(orgId),
      });
    },
  });
}

export function useAddOrganizationNode(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<Organization>) => createOrganization(values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

export function useUpdateOrganizationNode(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<Organization>;
    }) => updateOrganization(id, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

export function useAddPersonNode(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CreatePersonPayload) => createPerson(orgId, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

export function useAddPosition(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      unitId,
      values,
    }: {
      unitId: string;
      values: Partial<Position>;
    }) => createPositionApi(unitId, { ...values, organization: orgId }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

export function useAddSite(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateSitePayload) => createSite(orgId, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

export function useAddDelegation(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: DelegationCreatePayload) =>
      createDelegation(orgId, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}
