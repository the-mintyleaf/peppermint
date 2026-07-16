import {
  fetchUnitChildren,
  fetchUnitRoots,
  fetchUnitsFlat,
  searchUnits,
} from "../organization.api";
import { fetchOrganization } from "../../organizations/organizations.api";
import {
  createUnitMembership,
  fetchMemberships,
} from "../../members/members.api";
import {
  createUnit,
  deactivateUnit,
  fetchUnitAncestors,
  fetchUnitDescendants,
  fetchUnitDetail,
  moveUnit,
  updateUnit,
} from "../../structure/Structure.api";
import type { StructureDataSource } from "./structureDataSource.types";

/**
 * The production data source — pure wiring over the existing axios-backed
 * `*.api.ts` functions. This is the context default, so every consumer outside a
 * `StructureDataProvider` (and the real Structure Builder route) keeps its exact
 * current behavior.
 */
export const realStructureDataSource: StructureDataSource = {
  fetchOrganization,
  fetchUnitRoots,
  fetchUnitChildren,
  fetchUnitsFlat,
  searchUnits,
  fetchUnitDetail,
  fetchUnitAncestors,
  fetchUnitDescendants,
  createUnit,
  updateUnit,
  moveUnit,
  deactivateUnit,
  fetchMemberships,
  createUnitMembership,
};
