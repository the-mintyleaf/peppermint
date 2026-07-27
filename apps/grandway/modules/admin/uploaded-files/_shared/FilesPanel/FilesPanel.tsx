"use client";

import { useMemo, useState } from "react";
import {
  Anchor,
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ProfilePanelHeader } from "@/components/profile";
import { QueryErrorState } from "@/components/QueryErrorState";
import { FileFolderGrid, type FileFolder } from "./components/FileFolderGrid";
import { FileTileGrid } from "./components/FileTileGrid";
import { EditFileModal } from "../components/EditFileModal";
import { ReplaceFileModal } from "../components/ReplaceFileModal";
import { UploadFileModal } from "../components/UploadFileModal";
import { VerifyFileModal } from "../components/VerifyFileModal";
import { useFilesList } from "../../uploadedFiles.hooks";
import { FILE_CATEGORY_LABELS } from "../../uploadedFiles.labels";
import type { FileCategory, UploadedFile } from "../../uploadedFiles.types";
import type { FilesPanelProps } from "./FilesPanel.types";

/** Category display order — the label map's own key order, so it stays one source. */
const CATEGORY_ORDER = Object.keys(FILE_CATEGORY_LABELS) as FileCategory[];

/**
 * The reusable "files for this record" panel — every applicant/journey/offer
 * screen mounts this against its own `scope`, backed by the same one ledger
 * (`GET /files/?<owner>=<id>&is_archived=false`, §7/§CONCEPT). Document- and
 * snapshot-owned embeds are Admin-only in every respect (§1) — gating that is
 * the CALLER's responsibility (only mount this inside an admin-gated screen
 * for those owners); this panel itself only gates its own admin-only row
 * actions (Verify/Archive/Restore).
 *
 * Presented as folders, drilled into: a flat single-column list gave a
 * twenty-file record twenty full-width rows to scroll, when the operator
 * almost always knows the *kind* of file they want. `category` is the only
 * grouping the API models, and it happens to be exactly how people ask for
 * these ("the transcripts", "the offer letter") — so category is the folder.
 */
export function FilesPanel({ scope }: FilesPanelProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<FileCategory | null>(null);
  const [search, setSearch] = useState("");
  const [replaceFor, setReplaceFor] = useState<UploadedFile | null>(null);
  const [editFor, setEditFor] = useState<UploadedFile | null>(null);
  const [verifyFor, setVerifyFor] = useState<UploadedFile | null>(null);

  const { data, isLoading, isError, isRefetching, refetch } =
    useFilesList(scope);
  const files = useMemo(() => data?.data ?? [], [data?.data]);

  const folders = useMemo<FileFolder[]>(() => {
    const counts = new Map<FileCategory, number>();
    for (const file of files) {
      counts.set(file.category, (counts.get(file.category) ?? 0) + 1);
    }
    return CATEGORY_ORDER.filter((category) => counts.has(category)).map(
      (category) => ({
        category,
        label: FILE_CATEGORY_LABELS[category],
        count: counts.get(category) ?? 0,
      }),
    );
  }, [files]);

  const folderFiles = useMemo(() => {
    if (!openCategory) return [];
    const inFolder = files.filter((file) => file.category === openCategory);
    const q = search.trim().toLowerCase();
    if (!q) return inFolder;
    return inFolder.filter((file) =>
      file.original_filename.toLowerCase().includes(q),
    );
  }, [files, openCategory, search]);

  const closeFolder = () => {
    setOpenCategory(null);
    setSearch("");
  };

  const openFolder = (category: FileCategory) => {
    setOpenCategory(category);
    setSearch("");
  };

  return (
    <Stack gap="md">
      <ProfilePanelHeader
        title="Files"
        description="Uploaded scans and attachments for this record"
        count={isLoading ? undefined : files.length}
        action={
          <>
            {openCategory ? (
              <TextInput
                size="xs"
                placeholder="Search this folder"
                aria-label={`Search ${FILE_CATEGORY_LABELS[openCategory]}`}
                leftSection={<MagnifyingGlassIcon size={14} aria-hidden />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
            ) : null}
            <Button
              size="xs"
              leftSection={<PlusIcon size={14} aria-hidden />}
              onClick={() => setUploadOpen(true)}
            >
              Upload file
            </Button>
          </>
        }
      />

      {/* The trail is the only way back out of a folder, so it renders as a
          real link rather than a breadcrumb-shaped label. */}
      {openCategory ? (
        <Group gap={4} wrap="nowrap">
          <Anchor
            size="xs"
            component="button"
            type="button"
            onClick={closeFolder}
          >
            Files
          </Anchor>
          <CaretRightIcon size={12} aria-hidden />
          <Text size="xs" fw={500}>
            {FILE_CATEGORY_LABELS[openCategory]}
          </Text>
        </Group>
      ) : null}

      {isLoading ? (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      ) : isError ? (
        <QueryErrorState
          message="Couldn't load files."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : files.length === 0 ? (
        <Text size="xs" c="dimmed">
          No files yet — upload the first scan for this record.
        </Text>
      ) : !openCategory ? (
        <FileFolderGrid folders={folders} onOpen={openFolder} />
      ) : folderFiles.length === 0 ? (
        <Text size="xs" c="dimmed">
          No files in {FILE_CATEGORY_LABELS[openCategory]} match &ldquo;
          {search}&rdquo;.
        </Text>
      ) : (
        <FileTileGrid
          files={folderFiles}
          onReplace={setReplaceFor}
          onEdit={setEditFor}
          onVerify={setVerifyFor}
        />
      )}

      <UploadFileModal
        scope={scope}
        opened={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
      {replaceFor ? (
        <ReplaceFileModal
          file={replaceFor}
          opened={replaceFor !== null}
          onClose={() => setReplaceFor(null)}
        />
      ) : null}
      {editFor ? (
        <EditFileModal
          file={editFor}
          opened={editFor !== null}
          onClose={() => setEditFor(null)}
        />
      ) : null}
      {verifyFor ? (
        <VerifyFileModal
          file={verifyFor}
          opened={verifyFor !== null}
          onClose={() => setVerifyFor(null)}
        />
      ) : null}
    </Stack>
  );
}
