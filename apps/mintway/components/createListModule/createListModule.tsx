"use client";

import type { ComponentType } from "react";
import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import type { ListModuleConfig } from "./createListModule.types";

export type { ListModuleConfig };

/**
 * Collapses the identical `RequireStaff → ModalTableShell` list-module skeleton
 * into a config. The shell owns its own `ModuleHeader` (breadcrumbs derived from
 * `basePath`) and the toolbar's Add button, and `ModalPaper` is passed as the
 * shell body surface — so no outer header/wrapper is rendered here. Applies the
 * app's `getApiErrorMessage` resolver and the common shell defaults (id/data/meta
 * keys, page sizes) — all overridable via the config.
 *
 * @example
 * export const GrantsList = createListModule<Grant, GrantFormValues>({
 *   basePath: "/admin/authenticate/grants",
 *   queryKey: grantQueryKeys.list(),
 *   queryGetFn: fetchGrants,
 *   columns: grantsColumns,
 *   moduleInfo: { name: "grant", label: "Grants", description: "…" },
 *   createFormComponent: GrantForm,
 *   onCreateApi: (values) => createGrant(values as GrantCreatePayload),
 *   disableReviewButton: true,
 * });
 */
export function createListModule<
  TRow extends object,
  TCreate = TRow,
  TEdit = TCreate,
>(config: ListModuleConfig<TRow, TCreate, TEdit>): ComponentType {
  const { requireStaff = true, ...shellProps } = config;

  function ListModule() {
    const body = (
      <ModalTableShell<TRow, TCreate, TEdit>
        getErrorMessage={getApiErrorMessage}
        idAccessor="id"
        dataKey="data"
        paginationKey="meta"
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
        {...shellProps}
      />
    );
    return requireStaff ? <RequireStaff>{body}</RequireStaff> : body;
  }

  // Distinguish instances in React DevTools (both would otherwise read "ListModule").
  ListModule.displayName = `ListModule(${config.moduleInfo.name})`;

  return ListModule;
}
