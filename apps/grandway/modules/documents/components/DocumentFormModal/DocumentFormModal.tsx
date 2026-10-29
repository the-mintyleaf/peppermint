"use client";

import { useState } from "react";
import { Button, Group, Modal } from "@peppermint/ui";
import { ClipboardIcon } from "@phosphor-icons/react/dist/csr/Clipboard";
import {
  CLIPBOARD_DRAWER_OVER_MODAL_Z_INDEX,
  ClipboardDrawer,
} from "@/modules/admin/clipboard";
import type { DocumentFormModalProps } from "./DocumentFormModal.types";

/**
 * The modal every document form opens in (Edit fields, Create). Same Mantine Modal
 * as before, with a **Clipboard** button in its header — the header is sticky, so the
 * button stays in reach however far the form scrolls. It opens the full personal
 * clipboard drawer OVER the form:
 *
 * - The drawer is rendered beside the Modal, not inside it, so no click or key in the
 *   drawer bubbles (through the React tree) into the form.
 * - It sits at `CLIPBOARD_DRAWER_OVER_MODAL_Z_INDEX` (250) above the modal (200); its
 *   own confirms and select lists already stack higher.
 * - While it is open the modal does not close on Escape — Mantine closes every open
 *   modal on Escape from a window listener, which would discard the typed form. The
 *   form stays mounted underneath throughout; closing the drawer returns focus to
 *   the Clipboard button.
 *
 * The header is composed here (`Modal.Header` inside the body) rather than via
 * `title`, so the button sits beside the close button instead of inside the `<h2>`
 * that names the dialog.
 */
export function DocumentFormModal({
  opened,
  onClose,
  title,
  size,
  children,
}: DocumentFormModalProps) {
  const [clipboardOpen, setClipboardOpen] = useState(false);
  // A form that closes takes its drawer with it, and the next form opens without one.
  if (!opened && clipboardOpen) setClipboardOpen(false);
  const drawerOpen = opened && clipboardOpen;

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size={size}
        withCloseButton={false}
        closeOnEscape={!drawerOpen}
      >
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
          <Group gap="xs" wrap="nowrap">
            <Button
              type="button"
              variant="default"
              size="xs"
              leftSection={<ClipboardIcon size={14} aria-hidden />}
              onClick={() => setClipboardOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
            >
              Clipboard
            </Button>
            <Modal.CloseButton aria-label="Close" />
          </Group>
        </Modal.Header>
        {children}
      </Modal>
      <ClipboardDrawer
        opened={drawerOpen}
        onClose={() => setClipboardOpen(false)}
        zIndex={CLIPBOARD_DRAWER_OVER_MODAL_Z_INDEX}
      />
    </>
  );
}
