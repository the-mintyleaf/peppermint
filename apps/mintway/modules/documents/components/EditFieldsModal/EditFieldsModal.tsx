"use client";

import { Modal } from "@peppermint/ui";
import { useDocumentEditor } from "../../context";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import type { DocumentContent } from "../../documents.types";

export function EditFieldsModal() {
  const {
    activeDocument,
    editFieldsModalOpen,
    setEditFieldsModalOpen,
    updateDocumentContent,
    signatures,
  } = useDocumentEditor();

  if (!activeDocument) return null;

  const config = getDocumentTypeConfig(activeDocument.type);
  const Form = config.Form;

  // Bank statements carry a transactions table — give them a wider modal.
  const isWide = activeDocument.type.endsWith("-statement");

  const handleSubmit = (content: DocumentContent) => {
    updateDocumentContent(activeDocument.id, content);
    setEditFieldsModalOpen(false);
  };

  return (
    <Modal
      opened={editFieldsModalOpen}
      onClose={() => setEditFieldsModalOpen(false)}
      title={`Edit ${config.label} Fields`}
      size={isWide ? "xl" : "md"}
    >
      {Form && (
        <Form
          applicantId={activeDocument.applicantId}
          initialContent={activeDocument.content}
          signatures={signatures}
          onSubmit={handleSubmit}
          isLoading={false}
        />
      )}
    </Modal>
  );
}
