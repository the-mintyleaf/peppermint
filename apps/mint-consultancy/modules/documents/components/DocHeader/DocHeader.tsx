"use client";

import { Group, Text, ActionIcon } from "@zetsel/ui";
import Link from "next/link";
import { X as XIcon } from "@phosphor-icons/react/dist/csr/X";
import { FileText as DocumentIcon } from "@phosphor-icons/react/dist/csr/FileText";
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
  const { activeDocument, studentFullData, studentId } = useDocumentEditor();
  const currentDate = formatHeaderDate(new Date());

  const fileName =
    activeDocument?.label ??
    (studentFullData?.fullName
      ? `${studentFullData.fullName} — Documents`
      : `Student ${studentId} — Documents`);

  return (
    <div className={`${styles.bar} ${styles.barChrome} ${styles.barMain}`}>
      <Group gap={6} wrap="nowrap" className={styles.barLeft}>
        <Text size="xs" fw={500} component="span">
          zetsel.
          <Text span inherit c="brand.3">
            document
          </Text>
        </Text>
        <Group gap={4} wrap="nowrap" className={styles.barAppBadge}>
          <DocumentIcon size={12} color="var(--mantine-color-brand-3)" aria-hidden />
          <Text size="xs" component="span">
            zetsel docs
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
        <ActionIcon
          className={styles.barCloseBtn}
          component={Link}
          href="/admin/documents"
          variant="subtle"
          size="sm"
          aria-label="Close document editor"
        >
          <XIcon size={14} color="#fff" aria-hidden />
        </ActionIcon>
      </Group>
    </div>
  );
}
