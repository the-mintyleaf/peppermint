"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Tabs,
  Text,
  Title,
} from "@peppermint/ui";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { downloadFile } from "../../_shared/downloadFile";
import {
  openArchiveFileModal,
  openRestoreFileModal,
} from "../../_shared/fileLifecycleModals";
import { EditFileModal } from "../../_shared/components/EditFileModal";
import { ReplaceFileModal } from "../../_shared/components/ReplaceFileModal";
import { VerifyFileModal } from "../../_shared/components/VerifyFileModal";
import {
  useArchiveFile,
  useFileDetail,
  useRestoreFile,
} from "../../uploadedFiles.hooks";
import {
  FILE_CATEGORY_LABELS,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "../../uploadedFiles.labels";
import { FileOverviewPanel } from "./components/FileOverviewPanel";
import { FileVersionHistoryPanel } from "./components/FileVersionHistoryPanel";

type ActiveModal = "replace" | "edit" | "verify" | null;

function FileDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const { data: file, isLoading, isError, error, refetch } = useFileDetail(id);
  const archiveMutation = useArchiveFile(id);
  const restoreMutation = useRestoreFile(id);

  const notFound =
    isError && getApiError(error).code === "UPLOADED_FILES_FILE_NOT_FOUND";

  if (isLoading) {
    return (
      <ModalPaper withBorder>
        <Center h={300}>
          <Loader size="sm" />
        </Center>
      </ModalPaper>
    );
  }

  if (notFound) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            File not found.
          </Text>
          <Button size="xs" variant="default" onClick={() => router.back()}>
            Go back
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  if (isError || !file) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Couldn&apos;t load this file.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  const closeModal = () => setActiveModal(null);
  const canReplace = !file.is_archived && file.is_current;
  const canEdit = !file.is_archived;
  const canVerify = isAdmin && !file.is_archived;
  const canArchive = isAdmin && !file.is_archived;
  const canRestore = isAdmin && file.is_archived;

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Home", href: "/admin" },
          { label: file.original_filename, href: `/admin/files/${file.id}` },
        ]}
      />
      <ModalPaper withBorder>
        <Stack gap="md" p="md">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Stack gap={4}>
              <Group gap="xs">
                <Title order={4}>{file.original_filename}</Title>
                <Badge
                  size="sm"
                  variant="light"
                  color={VERIFICATION_STATUS_COLORS[file.verification_status]}
                >
                  {VERIFICATION_STATUS_LABELS[file.verification_status]}
                </Badge>
                {file.is_archived ? (
                  <Badge size="sm" color="gray" variant="outline">
                    Archived
                  </Badge>
                ) : null}
                {!file.is_current ? (
                  <Badge size="sm" color="gray" variant="outline">
                    Superseded
                  </Badge>
                ) : null}
              </Group>
              <Text size="xs" c="dimmed">
                {FILE_CATEGORY_LABELS[file.category]} · v{file.version_number}
              </Text>
            </Stack>

            <Group gap="xs">
              <Button
                size="xs"
                variant="default"
                leftSection={<DownloadSimpleIcon size={14} aria-hidden />}
                onClick={() => downloadFile(file.id, file.original_filename)}
              >
                Download
              </Button>
              {canReplace ? (
                <Button
                  size="xs"
                  variant="default"
                  leftSection={<ArrowsClockwiseIcon size={14} aria-hidden />}
                  onClick={() => setActiveModal("replace")}
                >
                  Replace
                </Button>
              ) : null}
              {canEdit ? (
                <Button
                  size="xs"
                  variant="default"
                  leftSection={<PencilSimpleIcon size={14} aria-hidden />}
                  onClick={() => setActiveModal("edit")}
                >
                  Edit
                </Button>
              ) : null}
              {canVerify ? (
                <Button
                  size="xs"
                  leftSection={<CheckCircleIcon size={14} aria-hidden />}
                  onClick={() => setActiveModal("verify")}
                >
                  Verify
                </Button>
              ) : null}
              {canArchive ? (
                <Button
                  size="xs"
                  color="red"
                  variant="light"
                  leftSection={<ProhibitIcon size={14} aria-hidden />}
                  onClick={() =>
                    openArchiveFileModal(file, async (reason) => {
                      await archiveMutation.mutateAsync({ reason });
                    })
                  }
                >
                  Archive
                </Button>
              ) : null}
              {canRestore ? (
                <Button
                  size="xs"
                  color="teal"
                  variant="light"
                  leftSection={
                    <ArrowCounterClockwiseIcon size={14} aria-hidden />
                  }
                  onClick={() =>
                    openRestoreFileModal(file, async (note) => {
                      await restoreMutation.mutateAsync(note ? { note } : {});
                    })
                  }
                >
                  Restore
                </Button>
              ) : null}
            </Group>
          </Group>

          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="versions">Version history</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="overview" pt="md">
              <FileOverviewPanel file={file} />
            </Tabs.Panel>
            <Tabs.Panel value="versions" pt="md">
              <FileVersionHistoryPanel fileId={file.id} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </ModalPaper>

      <ReplaceFileModal
        file={file}
        opened={activeModal === "replace"}
        onClose={closeModal}
        onReplaced={(newId) => router.push(`/admin/files/${newId}`)}
      />
      <EditFileModal
        file={file}
        opened={activeModal === "edit"}
        onClose={closeModal}
      />
      <VerifyFileModal
        file={file}
        opened={activeModal === "verify"}
        onClose={closeModal}
      />
    </>
  );
}

/** Reads are shared (admin + lead_manager); superadmin is refused everything (§1). */
export function ModuleFileDetail() {
  return (
    <RequireLeadAccess>
      <FileDetailContent />
    </RequireLeadAccess>
  );
}
