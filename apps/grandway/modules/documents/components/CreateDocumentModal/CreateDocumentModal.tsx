"use client";

import { Modal, notifications } from "@peppermint/ui";
import { useCallback, useEffect } from "react";
import { useDocumentEditor } from "../../context";
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
  } = useDocumentEditor();

  const config = createModalType
    ? getDocumentTypeConfig(createModalType)
    : null;
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

  const handleSubmit = useCallback(
    (content: DocumentContent) => {
      if (!createModalType) return;
      createDocumentWithContent(createModalType, content);
      closeCreateModal();
    },
    [createModalType, createDocumentWithContent, closeCreateModal],
  );

  return (
    <Modal
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
    </Modal>
  );
}
