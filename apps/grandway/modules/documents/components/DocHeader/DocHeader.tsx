"use client";

import {
  Group,
  Text,
  ActionIcon,
  Tooltip,
  useDisclosure,
} from "@peppermint/ui";
import { useRouter } from "next/navigation";
import { X as XIcon } from "@phosphor-icons/react/dist/csr/X";
import { FileText as DocumentIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { Signature as SignatureIcon } from "@phosphor-icons/react/dist/csr/Signature";
import { SignatureManagerModal } from "@/modules/admin/signatures";
import { useCapabilities } from "@/config/access";
import { useDocumentEditor } from "../../context";
import styles from "../../pages/editor/DocumentEditor.module.css";

function formatHeaderDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DocHeader() {
  const router = useRouter();
  const {
    activeDocument,
    studentFullData,
    applicantId,
    confirmLeave,
    canOpenWorkspaces,
  } = useDocumentEditor();
  const capabilities = useCapabilities();
  const [signaturesOpened, signatureManager] = useDisclosure(false);
  const currentDate = formatHeaderDate(new Date());

  // Keyed on the capability that governs the DESTINATION, not on write access —
  // they coincide for every tier today, but conflating them is exactly how a close
  // button ends up pointing at a route the viewer will be refused.
  const closeHref = canOpenWorkspaces
    ? "/admin/documents"
    : "/admin/documents/all";

  const handleClose = () => {
    confirmLeave(() => router.push(closeHref));
  };

  const fileName =
    activeDocument?.label ??
    (studentFullData?.fullName
      ? `${studentFullData.fullName} — Documents`
      : `Applicant ${applicantId} — Documents`);

  return (
    <div className={`${styles.bar} ${styles.barChrome} ${styles.barMain}`}>
      <Group gap={6} wrap="nowrap" className={styles.barLeft}>
        <Text size="xs" fw={500} component="span">
          mintway.
          <Text span inherit c="brand.3">
            document
          </Text>
        </Text>
        <Group gap={4} wrap="nowrap" className={styles.barAppBadge}>
          <DocumentIcon
            size={12}
            color="var(--mantine-color-brand-3)"
            aria-hidden
          />
          <Text size="xs" component="span">
            mintway docs
          </Text>
        </Group>
        <Text size="xs" component="span">
          |
        </Text>
        <Text className={styles.barTitle} component="span">
          Document Editor View
        </Text>
      </Group>

      <Text className={styles.barCenter} component="span" title={fileName}>
        {fileName}
      </Text>

      <Group gap="xs" wrap="nowrap" className={styles.barRightGroup}>
        <Text size="xs" className={styles.barDate} suppressHydrationWarning>
          {currentDate}
        </Text>
        {/* Opens in place rather than navigating: the operator is mid-document
            when they notice a signer is missing, and leaving the editor costs
            them that context. Keyed on `signatories`, NOT on `canEdit` — the
            signatory library is a different backend module with a stricter
            rule (it refuses superadmin as well as lead_manager, reads
            included), and conflating the two is how a control ends up pointing
            at an endpoint the viewer will be refused. */}
        {capabilities.signatories && (
          <Tooltip label="Manage signatures" withArrow>
            <ActionIcon
              className={styles.barCloseBtn}
              variant="subtle"
              size="sm"
              onClick={signatureManager.open}
              aria-label="Manage signatures"
            >
              <SignatureIcon size={14} color="#fff" aria-hidden />
            </ActionIcon>
          </Tooltip>
        )}
        <ActionIcon
          className={styles.barCloseBtn}
          variant="subtle"
          size="sm"
          onClick={handleClose}
          aria-label="Close document editor"
        >
          <XIcon size={14} color="#fff" aria-hidden />
        </ActionIcon>
      </Group>

      <SignatureManagerModal
        opened={signaturesOpened}
        onClose={signatureManager.close}
      />
    </div>
  );
}
