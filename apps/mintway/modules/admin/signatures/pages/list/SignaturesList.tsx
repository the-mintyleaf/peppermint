"use client";

import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper, useQueryClient } from "@peppermint/ui";
import { documentQueryKeys } from "@/modules/documents";
import type { Signature } from "@/modules/documents";
import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { SignatureForm } from "../../form";
import type { SignatureFormValues } from "../../form";
import {
  createSignature,
  listSignatures,
  toSignatureInput,
  updateSignature,
} from "../../signatures.api";
import { signaturesQueryKeys } from "../../signatures.queryKeys";
import { signaturesColumns } from "./signatures.columns";

function SignaturesListContent() {
  const queryClient = useQueryClient();

  // The full-screen editor's `useSignatures` reads a separate active-only key; the shell only
  // invalidates its own list key, so refresh the editor's key after create/edit too.
  const invalidateEditor = () =>
    queryClient.invalidateQueries({
      queryKey: documentQueryKeys.signatures(),
    });

  return (
    <ModalTableShell<Signature, SignatureFormValues>
      queryKey={signaturesQueryKeys.lists()}
      queryGetFn={async () => {
        const data = await listSignatures(false);
        return {
          data,
          meta: { total: data.length, page: 1, pageSize: data.length },
        };
      }}
      dataKey="data"
      paginationKey="meta"
      idAccessor="id"
      columns={signaturesColumns}
      moduleInfo={{
        name: "signature",
        label: "Signatures",
        description: "Signatories referenced by certificates",
      }}
      createModalTitle="Add signature"
      editModalTitle="Edit signature"
      createFormComponent={SignatureForm}
      editFormComponent={SignatureForm}
      onCreateApi={(values) => createSignature(toSignatureInput(values))}
      onEditApi={(values, record) =>
        updateSignature(record.id, toSignatureInput(values))
      }
      onCreateSuccess={invalidateEditor}
      onEditSuccess={invalidateEditor}
      getErrorMessage={getApiErrorMessage}
      disableReviewButton
      pageSizes={[10, 20, 50]}
      defaultPageSize={20}
      basePath="/admin/signatures"
      mainComponent={ModalPaper}
      mainComponentProps={{ withBorder: true }}
    />
  );
}

export function SignaturesList() {
  return (
    <RequireStaff>
      <SignaturesListContent />
    </RequireStaff>
  );
}
