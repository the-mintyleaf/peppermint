"use client";

import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import {
  createCountry,
  createField,
  createInstitutionCampus,
  fetchCountries,
  fetchFields,
  fetchInstitutionCampuses,
  fetchInstitutions,
  getProgram,
  updateCampus,
  updateCountry,
  updateField,
  updateInstitution,
  updateProgram,
} from "./institutions.api";
import {
  campusesByInstitutionKey,
  campusQueryKeys,
  countryQueryKeys,
  fieldQueryKeys,
  institutionQueryKeys,
  programQueryKeys,
} from "./institutions.queryKeys";
import type {
  Campus,
  CampusCreatePayload,
  CampusUpdatePayload,
  Country,
  CountryCreatePayload,
  CountryUpdatePayload,
  Field,
  FieldCreatePayload,
  FieldUpdatePayload,
  Institution,
} from "./institutions.types";

/** A generous single page for picker/reference lists (no server ordering here). */
const OPTION_PARAMS: QueryParams = {
  page: 1,
  pageSize: 100,
  search: "",
  sort: [],
  filters: {},
};

// ── Reads — picker / reference-list option sources ────────────────────────────

/** All countries (retired included) — filter picker + reference admin + form select. */
export function useCountries() {
  return useQuery({
    queryKey: countryQueryKeys.list("all"),
    queryFn: () => fetchCountries(OPTION_PARAMS),
    select: (res) => res.data,
  });
}

/** All fields (active and inactive) — `is_active` omitted returns both. */
export function useFields() {
  return useQuery({
    queryKey: fieldQueryKeys.list("all"),
    queryFn: () => fetchFields(OPTION_PARAMS),
    select: (res) => res.data,
  });
}

/** All institutions — filter picker + program form select. */
export function useInstitutions() {
  return useQuery({
    queryKey: institutionQueryKeys.list("all"),
    queryFn: () => fetchInstitutions(OPTION_PARAMS),
    select: (res) => res.data,
  });
}

/** Full program detail (entry expectations) for the drawer and the edit form. */
export function useProgramDetail(programId: string | null) {
  return useQuery({
    queryKey: programId
      ? programQueryKeys.detail(programId)
      : ["institutions.programs", "detail", "none"],
    queryFn: () => getProgram(programId as string),
    enabled: programId !== null,
  });
}

/** Campuses nested under one institution (drawer manager + program campus select). */
export function useInstitutionCampuses(institutionId: string | null) {
  return useQuery({
    queryKey: institutionId
      ? campusesByInstitutionKey(institutionId)
      : ["institutions.campuses", "byInstitution", "none"],
    queryFn: () => fetchInstitutionCampuses(institutionId as string),
    enabled: institutionId !== null,
    select: (res) => res.data,
  });
}

// ── Countries — writes (Admin only) ───────────────────────────────────────────

export function useCreateCountry() {
  return useAppMutation<Country, CountryCreatePayload>({
    mutationFn: createCountry,
    successMessage: "Country added.",
    errorTitle: "Couldn't add country",
    invalidateKeys: [countryQueryKeys.lists()],
  });
}

export function useUpdateCountry() {
  return useAppMutation<Country, { id: string; body: CountryUpdatePayload }>({
    mutationFn: ({ id, body }) => updateCountry(id, body),
    successMessage: "Country updated.",
    errorTitle: "Couldn't update country",
    // The program search is chain-aware (country availability drops a program
    // from the default results) and renders each program's derived country, so
    // any country change must refresh it too.
    invalidateKeys: [countryQueryKeys.lists(), programQueryKeys.lists()],
  });
}

/** Withdraw = PATCH availability_status→inactive; the reason becomes the note. */
export function useWithdrawCountry() {
  return useAppMutation<Country, { id: string; note: string }>({
    mutationFn: ({ id, note }) =>
      updateCountry(id, {
        availability_status: "inactive",
        availability_note: note,
      }),
    successMessage: "Country withdrawn from use.",
    errorTitle: "Couldn't withdraw country",
    invalidateKeys: [countryQueryKeys.lists(), programQueryKeys.lists()],
  });
}

// ── Fields — writes (Admin only; Field uses `is_active`, not availability) ──────

export function useCreateField() {
  return useAppMutation<Field, FieldCreatePayload>({
    mutationFn: createField,
    successMessage: "Field added.",
    errorTitle: "Couldn't add field",
    invalidateKeys: [fieldQueryKeys.lists()],
  });
}

export function useUpdateField() {
  return useAppMutation<Field, { id: string; body: FieldUpdatePayload }>({
    mutationFn: ({ id, body }) => updateField(id, body),
    successMessage: "Field updated.",
    errorTitle: "Couldn't update field",
    invalidateKeys: [fieldQueryKeys.lists()],
  });
}

/** Withdraw/restore a field via `is_active` (no availability note on Field). */
export function useSetFieldActive() {
  return useAppMutation<Field, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) => updateField(id, { is_active: isActive }),
    successMessage: (_data, { isActive }) =>
      isActive ? "Field restored." : "Field withdrawn from use.",
    errorTitle: "Couldn't update field",
    invalidateKeys: [fieldQueryKeys.lists()],
  });
}

// ── Institutions — row-action writes (Admin only) ─────────────────────────────

export function useWithdrawInstitution() {
  return useAppMutation<Institution, { id: string; note: string }>({
    mutationFn: ({ id, note }) =>
      updateInstitution(id, {
        availability_status: "inactive",
        availability_note: note,
      }),
    successMessage: "Institution withdrawn from use.",
    errorTitle: "Couldn't withdraw institution",
    // Institution availability is part of the program-search chain — refresh it.
    invalidateKeys: [institutionQueryKeys.lists(), programQueryKeys.lists()],
  });
}

// ── Campuses — writes (Admin only) ────────────────────────────────────────────

export function useCreateCampus(institutionId: string) {
  return useAppMutation<Campus, CampusCreatePayload>({
    mutationFn: (body) => createInstitutionCampus(institutionId, body),
    successMessage: "Campus added.",
    errorTitle: "Couldn't add campus",
    invalidateKeys: [campusesByInstitutionKey(institutionId)],
  });
}

export function useUpdateCampus(institutionId: string) {
  return useAppMutation<Campus, { id: string; body: CampusUpdatePayload }>({
    mutationFn: ({ id, body }) => updateCampus(id, body),
    successMessage: "Campus updated.",
    errorTitle: "Couldn't update campus",
    invalidateKeys: [
      campusesByInstitutionKey(institutionId),
      campusQueryKeys.lists(),
      // Campus availability is part of the program-search chain.
      programQueryKeys.lists(),
    ],
  });
}

export function useWithdrawCampus(institutionId: string) {
  return useAppMutation<Campus, { id: string; note: string }>({
    mutationFn: ({ id, note }) =>
      updateCampus(id, {
        availability_status: "inactive",
        availability_note: note,
      }),
    successMessage: "Campus withdrawn from use.",
    errorTitle: "Couldn't withdraw campus",
    invalidateKeys: [
      campusesByInstitutionKey(institutionId),
      programQueryKeys.lists(),
    ],
  });
}

// ── Programs — row-action writes (Admin only; create/edit go through the shell) ─

export function useWithdrawProgram() {
  return useAppMutation<unknown, { id: string; note: string }>({
    mutationFn: ({ id, note }) =>
      updateProgram(id, {
        availability_status: "inactive",
        availability_note: note,
      }),
    successMessage: "Program withdrawn from use.",
    errorTitle: "Couldn't withdraw program",
    invalidateKeys: [programQueryKeys.lists()],
  });
}
