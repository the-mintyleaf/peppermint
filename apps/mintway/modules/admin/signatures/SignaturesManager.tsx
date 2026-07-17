"use client";

import { useState } from "react";
import {
  Button,
  ModalPaper,
  ModuleHeader,
  notifications,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import { DataTableShell } from "@peppermint/admin";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { documentsApi, documentQueryKeys } from "@/modules/documents";
import type { Signature } from "@/modules/documents";
import { RequireStaff } from "@/components/RequireStaff";
import { getSignaturesColumns } from "./signatures.columns";
import { SignatureFormModal } from "./components/SignatureFormModal";

const signaturesListKey = ["documents", "signatures", "all"] as const;

/**
 * Admin Signatures module: CRUD for the signatories certificates reference. Lives inside the
 * admin shell (own top-level nav item); the full-screen editor consumes the same signatures
 * via `useSignatures`, so writes invalidate both this list and the editor's active-only key.
 */
export function SignaturesManager() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Signature | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: signaturesListKey });
    queryClient.invalidateQueries({ queryKey: documentQueryKeys.signatures() });
  };

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => documentsApi.deactivateSignature(id),
    onSuccess: () => {
      invalidate();
      notifications.show({
        title: "Signature deactivated",
        message: "It is retained for historical documents.",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Failed to deactivate signature",
        message: "Please try again.",
        color: "red",
      });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (signature: Signature) => {
    setEditing(signature);
    setModalOpen(true);
  };

  const columns = getSignaturesColumns({
    onEdit: openEdit,
    onDeactivate: (id) => deactivateMutation.mutate(id),
    deactivatingId: deactivateMutation.isPending
      ? (deactivateMutation.variables ?? null)
      : null,
  });

  return (
    <RequireStaff>
      <ModuleHeader
        breadcrumbItems={[{ label: "Signatures", href: "/admin/signatures" }]}
        right={
          <Button
            size="xs"
            leftSection={<PlusIcon size={14} />}
            onClick={openCreate}
          >
            Add signature
          </Button>
        }
      />
      <ModalPaper withBorder>
        <DataTableShell<Signature>
          queryKey={signaturesListKey}
          queryGetFn={async () => {
            const data = await documentsApi.listSignatures(false);
            return {
              data,
              meta: { total: data.length, page: 1, pageSize: data.length },
            };
          }}
          dataKey="data"
          paginationKey="meta"
          columns={columns}
          moduleInfo={{
            name: "signatures",
            label: "Signatures",
            description: "Signatories referenced by certificates",
          }}
          basePath="/admin/signatures"
          idAccessor="id"
          disableActions
          pageSizes={[10, 20, 50]}
          defaultPageSize={20}
        />
      </ModalPaper>

      {modalOpen && (
        <SignatureFormModal
          key={editing?.id ?? "new"}
          opened
          signature={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            invalidate();
            setModalOpen(false);
          }}
        />
      )}
    </RequireStaff>
  );
}
