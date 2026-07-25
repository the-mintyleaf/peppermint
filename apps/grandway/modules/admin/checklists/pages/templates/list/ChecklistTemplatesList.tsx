"use client";

import { useRouter } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireDocumentAccess } from "@/components/RequireDocumentAccess";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
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
 * Authoring is Admin-only (§1) — `RequireDocumentAccess` is reused for its
 * exact-admin gate (identical rule: `authorityType === "admin"`, nothing else),
 * same reuse the dispatch brief calls for and `FileReviewQueue` already does.
 */
function ChecklistTemplatesListContent() {
  const router = useRouter();
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
      createFormComponent={TemplateForm}
      editFormComponent={TemplateForm}
      onCreateApi={(values) => createTemplate(toCreateTemplatePayload(values))}
      onEditApi={(values, record) =>
        updateTemplate(record.id, toUpdateTemplatePayload(values))
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
    <RequireDocumentAccess>
      <ChecklistTemplatesListContent />
    </RequireDocumentAccess>
  );
}
