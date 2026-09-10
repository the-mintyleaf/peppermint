"use client";

import { useCallback, useRef, useState } from "react";
import { ActionIcon, Group, Modal, Text, Tooltip } from "@peppermint/ui";
import { ArrowLeft as BackIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { useCapabilities } from "@/config/access";
import { confirmDiscardChanges } from "../confirmDiscardChanges";
import { SignatoryListView } from "./components/SignatoryListView";
import {
  SignatoryCreateView,
  SignatoryEditView,
} from "./components/SignatoryEditView";
import type {
  SignatureManagerModalProps,
  SignatureManagerView,
} from "./SignatureManagerModal.types";

const TITLES: Record<SignatureManagerView["mode"], string> = {
  list: "Signature library",
  create: "New signatory",
  edit: "Edit signatory",
};

/**
 * The signatory library, managed in place from the document editor rather than
 * on a route of its own — the operator is mid-document when they discover a
 * signer is missing, and navigating away would cost them that context.
 *
 * Create and edit are **views of this one modal**, not nested modals: the
 * library is small, and a modal inside a modal is the wrong shape for it.
 *
 * The capability is re-checked here as well as at the control that opens this,
 * on the same "belt and braces" reasoning as `EditFieldsModal` — every route in
 * this domain refuses a non-Admin, reads included, so a surface that rendered
 * for one would be a screen of 403s.
 */
export function SignatureManagerModal({
  opened,
  onClose,
}: SignatureManagerModalProps) {
  const capabilities = useCapabilities();
  const [view, setView] = useState<SignatureManagerView>({ mode: "list" });

  // The dirty flag lives inside the form's `FormWrapper`, but the shell owns
  // every way out of it — the back arrow, Escape, the backdrop and the close
  // button — so the form publishes it up here. A ref rather than state: nothing
  // renders differently for it, and a re-render per keystroke would be waste.
  const isFormDirty = useRef(false);
  const reportDirty = useCallback((dirty: boolean) => {
    isFormDirty.current = dirty;
  }, []);

  if (!capabilities.signatories) return null;

  /** Every exit from a sub-screen goes through here, so the guard cannot be bypassed. */
  const leave = (go: () => void) => {
    if (!isFormDirty.current) {
      go();
      return;
    }
    confirmDiscardChanges(() => {
      isFormDirty.current = false;
      go();
    });
  };

  const backToList = () => leave(() => setView({ mode: "list" }));

  // Reopening lands on the library, not on whatever sub-screen was last open —
  // a stale edit view for a signatory the user has since forgotten about is a
  // worse starting point than the list. Done on the way out rather than in an
  // effect keyed on `opened`, which would be a cascading render for state React
  // can just as well settle here; every close path runs through this handler.
  const handleClose = () =>
    leave(() => {
      setView({ mode: "list" });
      onClose();
    });

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      title={
        <Group gap="xs" wrap="nowrap">
          {view.mode !== "list" ? (
            <Tooltip label="Back to the library" withArrow>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={backToList}
                aria-label="Back to the signature library"
              >
                <BackIcon size={14} aria-hidden />
              </ActionIcon>
            </Tooltip>
          ) : null}
          <Text size="sm" fw={900}>
            {TITLES[view.mode]}
          </Text>
        </Group>
      }
    >
      {view.mode === "list" ? (
        <SignatoryListView
          onCreate={() => setView({ mode: "create" })}
          onEdit={(id) => setView({ mode: "edit", id })}
        />
      ) : view.mode === "create" ? (
        <SignatoryCreateView
          onCancel={backToList}
          onDirtyChange={reportDirty}
          // A successful create is not a discard, so the guard must not fire on
          // the way to the edit screen — the form unmounts and clears it anyway,
          // but clearing here makes that independent of unmount ordering.
          onDone={(id) => {
            isFormDirty.current = false;
            setView({ mode: "edit", id });
          }}
        />
      ) : (
        <SignatoryEditView
          id={view.id}
          onCancel={backToList}
          onDirtyChange={reportDirty}
        />
      )}
    </Modal>
  );
}
