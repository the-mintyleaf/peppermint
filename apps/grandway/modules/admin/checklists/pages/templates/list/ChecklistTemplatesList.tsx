"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireCapability } from "@/components/RequireCapability";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { TemplateDrawer } from "../../../_shared/TemplateDrawer";
import {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
} from "../../../checklists.api";
import { getTemplateErrorMessage } from "../../../checklists.errors";
import { templateQueryKeys } from "../../../checklists.queryKeys";
import type { ChecklistTemplate } from "../../../checklists.types";
import {
  TemplateForm,
  toCreateTemplatePayload,
  toUpdateTemplatePayload,
} from "../../../form";
import type { CreateTemplateValues, UpdateTemplateValues } from "../../../form";
import { getTemplatesColumns } from "./templates.columns";

/**
 * Admin-only at the screen level. The backend grants `lead_manager` reads and
 * reserves the four authoring routes for Admin (§1) — the `checklists` capability
 * now gates the whole screen, so no Lead Manager reaches it either way. The inline
 * create/edit gates below are kept because they encode that narrower backend rule
 * directly (mirrors `ClientDirectory`'s `isAdmin ? Form : undefined`), and would
 * still hold if template reads were ever reopened to staff.
 */
function ChecklistTemplatesListContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The open template lives in the URL, not in component state. Global search
  // deep-links to `?template=<id>` and can land here while the list is already
  // mounted, so reading the param every render is the only way the drawer
  // reliably follows it; opening and closing rewrite the same param (`replace`,
  // so the back button still leaves the list) and leave the shell's own query
  // params untouched.
  const openedId = searchParams.get("template");
  const setOpenedId = useCallback(
    (templateId: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (templateId) next.set("template", templateId);
      else next.delete("template");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, pathname, router],
  );
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";
  const columns = getTemplatesColumns({
    onViewDetails: (template) => setOpenedId(template.id),
  });

  return (
    <>
      <ModalTableShell<
        ChecklistTemplate,
        CreateTemplateValues,
        UpdateTemplateValues
      >
        queryKey={templateQueryKeys.lists()}
        queryGetFn={listTemplates}
        enableServerQuery
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={columns}
        moduleInfo={{
          name: "checklist-template",
          label: "Workflow templates",
          description: "One requirement list per destination country",
        }}
        createModalTitle="New template"
        editModalTitle="Edit template"
        createFormComponent={isAdmin ? TemplateForm : undefined}
        editFormComponent={isAdmin ? TemplateForm : undefined}
        onCreateApi={
          isAdmin
            ? (values) => createTemplate(toCreateTemplatePayload(values))
            : undefined
        }
        onEditApi={
          isAdmin
            ? (values, record) =>
                updateTemplate(record.id, toUpdateTemplatePayload(values))
            : undefined
        }
        onEditTrigger={(record) => getTemplate(record.id)}
        getErrorMessage={getTemplateErrorMessage}
        disableReviewButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        basePath="/admin/checklists/templates"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />
      <TemplateDrawer
        templateId={openedId}
        opened={openedId !== null}
        onClose={() => setOpenedId(null)}
      />
    </>
  );
}

export function ModuleChecklistTemplatesList() {
  return (
    <RequireCapability capability="checklists">
      <ChecklistTemplatesListContent />
    </RequireCapability>
  );
}
