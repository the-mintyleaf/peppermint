"use client";

import {
  Badge,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@peppermint/ui";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { FileIcon } from "@phosphor-icons/react/dist/csr/File";
import { FileImageIcon } from "@phosphor-icons/react/dist/csr/FileImage";
import { FilePdfIcon } from "@phosphor-icons/react/dist/csr/FilePdf";
import { FileRowActionsMenu } from "../../../components/FileRowActionsMenu";
import { downloadFile } from "../../../downloadFile";
import {
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "../../../../uploadedFiles.labels";
import {
  formatFileSize,
  getFileViewKind,
  type FileViewKind,
} from "../../../../uploadedFiles.utils";
import type { FileTileGridProps, FileTileProps } from "./FileTileGrid.types";
import classes from "./FileTileGrid.module.css";

/** Glyph + tint per kind — the type is visible before anything is fetched. */
const KIND_GLYPHS: Record<
  FileViewKind,
  { Icon: typeof FileIcon; color: string }
> = {
  image: { Icon: FileImageIcon, color: "teal" },
  pdf: { Icon: FilePdfIcon, color: "red" },
  download: { Icon: FileIcon, color: "gray" },
};

/**
 * One tile per file inside an open folder — a type glyph, the filename, a
 * visible "View"/"Download" cue, then the two facts that decide whether this
 * is the right copy: its size and whether anyone has verified it. Archived
 * and superseded are called out in words, never by dimming alone.
 *
 * The glyph + name + cue are ONE real `<button>`: images/PDFs open the in-app
 * viewer, anything else downloads under its original filename. Nothing is
 * fetched until that click — every download is an audited read, so the list
 * draws no thumbnails.
 *
 * Long names: the name is a single ellipsized line (`truncate`) at a fixed
 * `w="100%"`, inside `miw={0}` parents and a `min-width: 0` grid item — the
 * overflow came from the tile's centred flex column sizing the name to its
 * unbreakable max-content width. The full name is in the tooltip (hover and
 * keyboard focus) and in the button's accessible name.
 */
function FileTile({
  file,
  onPreview,
  onReplace,
  onEdit,
  onVerify,
}: FileTileProps) {
  const kind = getFileViewKind(file);
  const isDownload = kind === "download";
  const actionLabel = isDownload ? "Download" : "View";
  const CueIcon = isDownload ? DownloadSimpleIcon : EyeIcon;
  const { Icon, color } = KIND_GLYPHS[kind];

  const handleOpen = () => {
    if (isDownload) void downloadFile(file.id, file.original_filename);
    else onPreview(file);
  };

  return (
    <div className={classes.tile}>
      <div className={classes.tileMenu}>
        <FileRowActionsMenu
          file={file}
          onPreview={onPreview}
          onReplace={onReplace}
          onEdit={onEdit}
          onVerify={onVerify}
        />
      </div>

      <Stack align="stretch" gap={6} miw={0}>
        <Tooltip
          label={file.original_filename}
          withArrow
          multiline
          maw={280}
          openDelay={300}
          style={{ overflowWrap: "anywhere" }}
        >
          <UnstyledButton
            className={classes.open}
            onClick={handleOpen}
            aria-label={`${actionLabel} ${file.original_filename}`}
          >
            <Stack align="center" gap={6} miw={0}>
              <ThemeIcon variant="light" size={64} radius="sm" color={color}>
                <Icon size={28} aria-hidden />
              </ThemeIcon>
              <Text size="xs" fw={500} ta="center" truncate="end" w="100%">
                {file.original_filename}
              </Text>
              <Group gap={4} justify="center" wrap="nowrap">
                <CueIcon size={12} aria-hidden />
                <Text size="xs" c="blue" fw={500}>
                  {actionLabel}
                </Text>
              </Group>
            </Stack>
          </UnstyledButton>
        </Tooltip>

        <Stack align="center" gap={4} miw={0}>
          <Text size="xs" c="dimmed">
            v{file.version_number} · {formatFileSize(file.size_bytes)}
          </Text>
          <Group gap={4} justify="center" wrap="wrap">
            <Badge
              size="xs"
              variant="light"
              color={VERIFICATION_STATUS_COLORS[file.verification_status]}
            >
              {VERIFICATION_STATUS_LABELS[file.verification_status]}
            </Badge>
            {file.is_archived ? (
              <Badge size="xs" color="gray" variant="outline">
                Archived
              </Badge>
            ) : null}
            {!file.is_current ? (
              <Badge size="xs" color="gray" variant="outline">
                Superseded
              </Badge>
            ) : null}
          </Group>
        </Stack>
      </Stack>
    </div>
  );
}

/**
 * The contents of one open folder. Empty and no-results states belong to the
 * calling panel — this draws a non-empty grid only.
 */
export function FileTileGrid({
  files,
  onPreview,
  onReplace,
  onEdit,
  onVerify,
}: FileTileGridProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
      {files.map((file) => (
        <FileTile
          key={file.id}
          file={file}
          onPreview={onPreview}
          onReplace={onReplace}
          onEdit={onEdit}
          onVerify={onVerify}
        />
      ))}
    </SimpleGrid>
  );
}
