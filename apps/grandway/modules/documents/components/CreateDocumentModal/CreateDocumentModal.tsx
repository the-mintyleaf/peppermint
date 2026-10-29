"use client";

import { useCallback, useEffect } from "react";
import { notifications } from "@peppermint/ui";
import { useDocumentEditor } from "../../context";
import { DocumentFormModal } from "../DocumentFormModal";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import type { DocumentContent } from "../../documents.types";

export function CreateDocumentModal() {
  const {
    applicantId,
    createModalOpen,
    createModalType,
    closeCreateModal,
    createDocumentWithContent,
    isCreatingDocument,
    studentFullData,
    signatures,
    canEdit,
  } = useDocumentEditor();

  // Belt and braces — the provider already refuses to open it for a reader.
  const config =
    canEdit && createModalType ? getDocumentTypeConfig(createModalType) : null;
  const Form = config?.Form;

  useEffect(() => {
    if (createModalOpen && createModalType && !config) {
      notifications.show({
        title: "Invalid document type",
        message: `Document type "${createModalType}" not found`,
        color: "red",
      });
      closeCreateModal();
    }
  }, [createModalOpen, createModalType, config, closeCreateModal]);

  // Closes on success only: a refused body keeps the form (and what was typed)
  // open, and the certificate form marks the refused fields from the rejection.
  const handleSubmit = useCallback(
    (content: DocumentContent) => {
      if (!createModalType) return;
      const creating = createDocumentWithContent(createModalType, content);
      creating.then(closeCreateModal, () => undefined);
      return creating;
    },
    [createModalType, createDocumentWithContent, closeCreateModal],
  );

  return (
    <DocumentFormModal
      opened={createModalOpen && !!createModalType}
      onClose={closeCreateModal}
      title={config ? `Create ${config.label}` : "Create page"}
      size="lg"
    >
      {Form && createModalType && (
        <Form
          applicantId={applicantId}
          studentFullData={studentFullData}
          signatures={signatures}
          onSubmit={handleSubmit}
          isLoading={isCreatingDocument}
        />
      )}
    </DocumentFormModal>
  );
}
