"use client";

import { openReasonConfirmModal } from "@peppermint/admin";
import { Button } from "@peppermint/ui";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useRemoveSignatorySignature } from "../../../signatures.hooks";
import type { Signatory } from "../../../signatures.types";

/**
 * Removal is **archiving the file** on the `uploaded_files` module — this API
 * has no removal endpoint (§3). Only offered when an uploaded file is actually
 * in force; an external link is cleared by emptying the URL field above, and
 * there is nothing to remove when the source is `none`.
 *
 * The confirm names what will render afterwards, because the fallback is not
 * obvious: clearing an uploaded image does not always mean a blank signature —
 * a signatory that also has a URL falls back to it.
 */
export function RemoveSignatureAction({ signatory }: { signatory: Signatory }) {
  const fileId = signatory.signature_file?.id ?? "";
  const mutation = useRemoveSignatorySignature(fileId);

  if (signatory.signature_source !== "uploaded" || !fileId) return null;

  const fallsBackTo = signatory.signature_image_url
    ? "the external link in the details above"
    : "a blank signature";

  const confirm = () =>
    openReasonConfirmModal({
      title: "Remove signature image",
      alertTitle: `${signatory.name}'s signature will stop rendering`,
      description: `Certificates naming this signer will fall back to ${fallsBackTo} — including ones already issued, since a reprint resolves the signature live. The file itself is archived, not deleted, and can be restored from the file record.`,
      tone: "danger",
      reasonLabel: "Reason",
      reasonPlaceholder: "Why is this signature being withdrawn?",
      confirmLabel: "Remove signature",
      confirmColor: "red",
      onConfirm: async (reason) => {
        await mutation.mutateAsync({ reason });
      },
    });

  return (
    <Button
      size="xs"
      variant="subtle"
      color="red"
      loading={mutation.isPending}
      leftSection={<TrashIcon size={14} aria-hidden />}
      onClick={confirm}
    >
      Remove
    </Button>
  );
}
