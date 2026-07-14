"use client";

import type { ComponentType } from "react";
import { ModalTableShell } from "@peppermint/admin";
import type { ModalTableShellProps } from "@peppermint/admin";
import { ModalPaper, ModuleHeader } from "@peppermint/ui";
import type { ModuleHeaderBreadcrumbItem } from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";

export interface ListModuleConfig<
  TRow extends object,
  TCreate = TRow,
  TEdit = TCreate,
> extends ModalTableShellProps<TRow, TCreate, TEdit> {
  /** Breadcrumb items rendered in the ModuleHeader above the table. */
  breadcrumb: ModuleHeaderBreadcrumbItem[];
  /** Gate the module behind staff access. Defaults to true. */
  requireStaff?: boolean;
}

/**
 * Collapses the identical `RequireStaff → ModuleHeader → ModalPaper →
 * ModalTableShell` list-module skeleton into a config. Applies the app's
 * `getApiErrorMessage` resolver and the common shell defaults (id/data/meta keys,
 * page sizes) — all overridable via the config.
 *
 * @example
 * export const GrantsList = createListModule<Grant, GrantFormValues>({
 *   breadcrumb: [{ label: "Grants", href: "/admin/authenticate/grants" }],
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
  const { breadcrumb, requireStaff = true, ...shellProps } = config;

  function ListModule() {
    const body = (
      <>
        <ModuleHeader breadcrumbItems={breadcrumb} />
        <ModalPaper withBorder>
          <ModalTableShell<TRow, TCreate, TEdit>
            getErrorMessage={getApiErrorMessage}
            idAccessor="id"
            dataKey="data"
            paginationKey="meta"
            pageSizes={[10, 20, 30, 50]}
            defaultPageSize={20}
            {...shellProps}
          />
        </ModalPaper>
      </>
    );
    return requireStaff ? <RequireStaff>{body}</RequireStaff> : body;
  }

  return ListModule;
}
