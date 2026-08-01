"use client";

import { Modal } from "@peppermint/ui";
import { useDocumentEditor } from "../../context";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import type { DocumentContent } from "../../documents.types";

/**
 * The deliberate "Edit fields → Save" surface. Grandway's document update takes no
 * `change_reason` (the audit log records the edit as a marker, and `content` replaces
 * wholesale), so this is a plain fields form — each document type's `Form` owns its own
 * submit control. Blank fields simply save the current content unchanged.
 */
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
      size={config.formModalSize ?? "xl"}
    >
      {/* The theme zeroes the modal body padding; each `Form` supplies its own `p="md"`. */}
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
