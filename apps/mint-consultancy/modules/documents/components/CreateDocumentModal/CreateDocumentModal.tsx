"use client";

import { Modal, notifications, useMutation, useQueryClient } from "@zetsel/ui";
import { useDocumentEditor } from "../../context";
import { documentsApi } from "../../documents.api";
import { documentQueryKeys } from "../../documents.queryKeys";
import { getDefaultLabel, getDocumentTypeConfig } from "../../documentTypeConfig";
import type { DocumentContent } from "../../documents.types";

export function CreateDocumentModal() {
  const queryClient = useQueryClient();
  const {
    studentId,
    studentFullData,
    createModalOpen,
    createModalType,
    closeCreateModal,
    addDocumentToList,
  } = useDocumentEditor();

  const createMutation = useMutation({
    mutationFn: documentsApi.create,
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.list(studentId) });
      addDocumentToList(doc);
      closeCreateModal();
      notifications.show({ title: "Document created", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Failed to create document", color: "red" });
    },
  });

  if (!createModalType) return null;

  const config = getDocumentTypeConfig(createModalType);
  const Form = config.Form;

  const handleSubmit = (content: DocumentContent) => {
    createMutation.mutate({
      studentId,
      type: createModalType,
      label: getDefaultLabel(createModalType),
      content,
    });
  };

  return (
    <Modal
      opened={createModalOpen}
      onClose={closeCreateModal}
      title={`Create ${config.label}`}
      size="md"
    >
      <Form
        studentId={studentId}
        studentFullData={studentFullData}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </Modal>
  );
}
