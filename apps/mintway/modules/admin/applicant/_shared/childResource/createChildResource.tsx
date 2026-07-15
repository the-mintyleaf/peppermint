"use client";

import { useMemo } from "react";
import { createResourceApi, ModalTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";

import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import type {
  ChildResourceConfig,
  ChildResourceSectionProps,
} from "./createChildResource.types";

/**
 * Build a self-contained nested-CRUD section for one applicant child resource.
 * Given a slug + columns + form, returns a component that lists/creates/edits/deletes
 * the child under the current applicant via `ModalTableShell`, scoped to
 * `/api/v1/applicants/:applicantId/:slug`. This is the DRY workhorse behind the ~16
 * profile/CRM child sections (§5, §8) — parent lock/archive rejections surface through
 * the shared `getApiErrorMessage` resolver.
 *
 * @example
 * export const EmergencyContactsSection = createChildResource<EmergencyContact, ...>({
 *   slug: "emergency-contacts",
 *   moduleInfo: { name: "emergency-contact", label: "Emergency contacts" },
 *   columns, createFormComponent: EmergencyContactForm,
 * });
 */
export function createChildResource<
  TRow extends object & { id: string },
  TCreate extends object = TRow,
  TEdit extends object = TCreate,
>(config: ChildResourceConfig<TRow, TCreate, TEdit>) {
  function ChildResourceSection({ applicantId }: ChildResourceSectionProps) {
    const resource = useMemo(
      () =>
        createResourceApi<TRow, TCreate, TEdit>({
          client: api,
          basePath: `/api/v1/applicants/${applicantId}/${config.slug}`,
          defaultParams: config.defaultParams,
        }),
      [applicantId],
    );

    // String-array key namespaced by slug + applicantId so two applicants' child
    // lists never collide in the React Query cache (the shell type wants string[]).
    const queryKey: string[] = [
      `applicant.child.${config.slug}`,
      "list",
      applicantId,
    ];

    return (
      <ModalPaper withBorder>
        <ModalTableShell<TRow, TCreate, TEdit>
          queryKey={queryKey}
          queryGetFn={(params) => resource.list(params)}
          enableServerQuery
          dataKey="data"
          paginationKey="meta"
          idAccessor="id"
          columns={config.columns}
          moduleInfo={config.moduleInfo}
          modalWidth={config.modalWidth}
          createModalTitle={config.createModalTitle}
          editModalTitle={config.editModalTitle}
          createFormComponent={config.createFormComponent}
          editFormComponent={
            config.disableEdit
              ? undefined
              : (config.editFormComponent ??
                (config.createFormComponent as never))
          }
          onCreateApi={(values) =>
            resource.create(
              config.transformCreate ? config.transformCreate(values) : values,
            )
          }
          onEditApi={
            config.disableEdit
              ? undefined
              : (values, record) =>
                  resource.update(
                    record.id,
                    config.transformEdit
                      ? config.transformEdit(values, record)
                      : values,
                  )
          }
          onDeleteApi={
            config.disableDelete ? undefined : (id) => resource.remove(id)
          }
          disableReviewButton
          getErrorMessage={getApiErrorMessage}
          pageSizes={[10, 20, 30, 50]}
          defaultPageSize={config.defaultPageSize ?? 20}
        />
      </ModalPaper>
    );
  }

  ChildResourceSection.displayName = `ChildResource(${config.slug})`;
  return ChildResourceSection;
}
