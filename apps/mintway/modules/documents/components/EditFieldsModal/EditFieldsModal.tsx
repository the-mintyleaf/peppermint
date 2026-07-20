"use client";

import { useEffect, useState } from "react";
import { Box, Modal, TextInput } from "@peppermint/ui";
import { useDocumentEditor } from "../../context";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import type { DocumentContent } from "../../documents.types";

/** Long enough for a real sentence, short enough to stay a one-line history label. */
const REASON_MAX_LENGTH = 200;

/**
 * Where `change_reason` is captured.
 *
 * The reason rides the document PATCH, and every PATCH appends a revision — so the naive
 * option is to ask on every save. That is the wrong surface: content is written from this
 * one deliberate "Edit fields → Save" action, but the Customizations panel writes on every
 * keystroke (render-only, via `updateDocumentContentLocal`) and a version conflict silently
 * re-issues the PATCH. A modal-per-save, or a required field, would tax the frequent path to
 * serve the rare one, and operators would defeat it by typing "update".
 *
 * So: one **optional** inline input, in the one place the operator has already decided to
 * make an edit and is about to confirm it. It sits above the fields rather than beside the
 * button because each document type's `Form` owns its own submit control — anything rendered
 * after the Form would land below that button, out of the reading order of the save it
 * annotates. Blank is the normal case and costs nothing: the field is omitted from the
 * payload and the revision reads "No reason given" exactly as it does today.
 *
 * The status actions (`ready`/`finalize`/`submit`/`archive`) are the other deliberate
 * moments, but those endpoints take **no body** (`document.md` §3) and append no content
 * revision, so there is nothing to attach a reason to there.
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

  const [reason, setReason] = useState("");

  // A reason describes exactly one edit — never carry it into the next open, or into a
  // different document, where it would silently mislabel that revision.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReason("");
  }, [editFieldsModalOpen, activeDocument?.id]);

  if (!activeDocument) return null;

  const config = getDocumentTypeConfig(activeDocument.type);
  const Form = config.Form;

  const handleSubmit = (content: DocumentContent) => {
    updateDocumentContent(activeDocument.id, content, reason);
    setEditFieldsModalOpen(false);
  };

  return (
    <Modal
      opened={editFieldsModalOpen}
      onClose={() => setEditFieldsModalOpen(false)}
      title={`Edit ${config.label} Fields`}
      size="xl"
    >
      {/* The theme zeroes the modal body padding; each `Form` supplies its own `p="md"`,
          so only this field needs padding restored — and no bottom padding, or it would
          double up against the Form's own top padding. */}
      <Box px="md" pt="md">
        <TextInput
          label="Reason for this change"
          description="Optional — recorded against this version in the document's history."
          placeholder="e.g. Corrected the account holder name"
          maxLength={REASON_MAX_LENGTH}
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
        />
      </Box>
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
