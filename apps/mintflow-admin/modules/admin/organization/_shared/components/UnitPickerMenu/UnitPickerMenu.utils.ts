import type { OrganizationUnit } from "../../organization.types";
import type { UnitOption } from "./UnitPickerMenu.types";

/**
 * Flattens the unit list into depth-ordered menu options. Sorted by
 * `path_cache` so children sit directly under their parent, and `depth` is
 * kept so the menu can indent nested units.
 */
export function buildUnitOptions(
  units: OrganizationUnit[] | undefined,
): UnitOption[] {
  return (units ?? [])
    .slice()
    .sort((a, b) => a.path_cache.localeCompare(b.path_cache))
    .map((unit) => ({
      value: unit.id,
      label: `${unit.name_np} (${unit.code})`,
      depth: unit.depth,
    }));
}
