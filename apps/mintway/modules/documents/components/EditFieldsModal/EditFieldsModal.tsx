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
    studentFullData,
    signatures,
  } = useDocumentEditor();

  if (!activeDocument) return null;

  const config = getDocumentTypeConfig(activeDocument.type);
  const Form = config.Form;

  const handleSubmit = (content: DocumentContent) => {
    updateDocumentContent(activeDocument.id, content);
    setEditFieldsModalOpen(false);
  };

  return (
    <Modal
      opened={editFieldsModalOpen}
      onClose={() => setEditFieldsModalOpen(false)}
      title={`Edit ${config.label} Fields`}
      size="xl"
    >
      {Form && (
        <Form
          applicantId={activeDocument.applicantId}
          studentFullData={studentFullData}
          initialContent={activeDocument.content}
          signatures={signatures}
          onSubmit={handleSubmit}
          isLoading={false}
        />
      )}
    </Modal>
  );
}
