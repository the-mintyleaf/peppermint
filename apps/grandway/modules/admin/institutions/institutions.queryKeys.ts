import { createQueryKeys } from "@peppermint/admin";

export const fieldQueryKeys = createQueryKeys("institutions.fields");
export const countryQueryKeys = createQueryKeys("institutions.countries");
export const institutionQueryKeys = createQueryKeys(
  "institutions.institutions",
);
export const campusQueryKeys = createQueryKeys("institutions.campuses");
export const programQueryKeys = createQueryKeys("institutions.programs");

/** Campuses are listed nested under an institution — key by that parent id. */
export const campusesByInstitutionKey = (institutionId: string) =>
  [...institutionQueryKeys.detail(institutionId), "campuses"] as const;
