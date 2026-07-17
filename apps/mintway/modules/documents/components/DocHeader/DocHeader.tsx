"use client";

import { Group, Text, ActionIcon, Tooltip } from "@peppermint/ui";
import { useRouter } from "next/navigation";
import { X as XIcon } from "@phosphor-icons/react/dist/csr/X";
import { FileText as DocumentIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { Signature as SignatureIcon } from "@phosphor-icons/react/dist/csr/Signature";
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
  const { activeDocument, studentFullData, applicantId, confirmLeave } =
    useDocumentEditor();
  const currentDate = formatHeaderDate(new Date());

  const handleClose = () => {
    confirmLeave(() => router.push("/admin/documents"));
  };

  const handleManageSignatures = () => {
    confirmLeave(() => router.push("/admin/signatures"));
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
        <Tooltip label="Manage signatures" withArrow>
          <ActionIcon
            className={styles.barCloseBtn}
            variant="subtle"
            size="sm"
            onClick={handleManageSignatures}
            aria-label="Manage signatures"
          >
            <SignatureIcon size={14} color="#fff" aria-hidden />
          </ActionIcon>
        </Tooltip>
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
    </div>
  );
}
