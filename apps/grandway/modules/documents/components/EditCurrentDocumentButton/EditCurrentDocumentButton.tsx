"use client";

import { Button } from "@peppermint/ui";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { useDocumentEditor } from "../../context";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import styles from "../../pages/editor/DocumentEditor.module.css";

interface EditCurrentDocumentButtonProps {
  rightOffset: number;
}

export function EditCurrentDocumentButton({
  rightOffset,
}: EditCurrentDocumentButtonProps) {
  const { activeDocument, isActiveDocumentEditable, setEditFieldsModalOpen } =
    useDocumentEditor();

  // One predicate for all of it — role, missing document, archived status, and
  // historical preview. It used to re-derive three of those here.
  if (!isActiveDocumentEditable || !activeDocument) {
    return null;
  }

  const config = getDocumentTypeConfig(activeDocument.type);
  if (!config.Form) {
    return null;
  }

  return (
    <Button
      className={`${styles.editDocumentBtn} no-print`}
      style={{ right: rightOffset }}
      size="sm"
      variant="filled"
      leftSection={<EditIcon size={14} aria-hidden />}
      onClick={() => setEditFieldsModalOpen(true)}
      aria-label="Edit"
    >
      Edit
    </Button>
  );
}
