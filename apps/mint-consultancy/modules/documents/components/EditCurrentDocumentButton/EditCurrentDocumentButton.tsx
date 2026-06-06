"use client";

import { Button } from "@zetsel/ui";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { useDocumentEditor } from "../../context";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import styles from "../../pages/editor/DocumentEditor.module.css";

interface EditCurrentDocumentButtonProps {
  rightOffset: number;
}

export function EditCurrentDocumentButton({ rightOffset }: EditCurrentDocumentButtonProps) {
  const { activeDocument, activeHistoricalLog, setEditFieldsModalOpen } = useDocumentEditor();

  if (!activeDocument || activeHistoricalLog) {
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
      aria-label="Edit only"
    >
      Edit only
    </Button>
  );
}
