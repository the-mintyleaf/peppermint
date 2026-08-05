"use client";

import { useRouter } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireCapability } from "@/components/RequireCapability";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
} from "../../../checklists.api";
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
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";
  const columns = getTemplatesColumns({
    onViewDetails: (template) =>
      router.push(`/admin/checklists/templates/${template.id}`),
  });

  return (
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
        label: "Checklist templates",
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
      getErrorMessage={getApiErrorMessage}
      disableReviewButton
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
      basePath="/admin/checklists/templates"
      mainComponent={ModalPaper}
      mainComponentProps={{ withBorder: true }}
    />
  );
}

export function ModuleChecklistTemplatesList() {
  return (
    <RequireCapability capability="checklists">
      <ChecklistTemplatesListContent />
    </RequireCapability>
  );
}
