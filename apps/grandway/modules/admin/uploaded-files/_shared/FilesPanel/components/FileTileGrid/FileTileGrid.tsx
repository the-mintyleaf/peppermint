"use client";

import {
  Badge,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@peppermint/ui";
import { FileIcon } from "@phosphor-icons/react/dist/csr/File";
import { FileRowActionsMenu } from "../../../components/FileRowActionsMenu";
import { useFileBlob } from "../../../useFileBlob";
import {
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "../../../../uploadedFiles.labels";
import {
  PREVIEWABLE_CATEGORIES,
  formatFileSize,
} from "../../../../uploadedFiles.utils";
import type { FileTileGridProps, FileTileProps } from "./FileTileGrid.types";
import classes from "./FileTileGrid.module.css";

/**
 * One tile per file inside an open folder — a thumbnail (image categories
 * only) or a file glyph, the filename beneath it, and the two facts that
 * decide whether this is the right copy: its size and whether anyone has
 * verified it. Archived and superseded are called out in words, never by
 * dimming alone.
 */
function FileTile({ file, onReplace, onEdit, onVerify }: FileTileProps) {
  const previewable = PREVIEWABLE_CATEGORIES.has(file.category);
  const { url: previewUrl } = useFileBlob(file.id, previewable);

  return (
    <div className={classes.tile}>
      <div className={classes.tileMenu}>
        <FileRowActionsMenu
          file={file}
          onReplace={onReplace}
          onEdit={onEdit}
          onVerify={onVerify}
        />
      </div>

      <Stack align="center" gap={6}>
        <div className={classes.preview}>
          {previewable && previewUrl ? (
            <Image
              src={previewUrl}
              alt={file.original_filename}
              w={64}
              h={64}
              radius="sm"
              fit="cover"
            />
          ) : (
            <ThemeIcon variant="light" size={64} radius="sm" color="gray">
              <FileIcon size={28} aria-hidden />
            </ThemeIcon>
          )}
        </div>

        <Stack align="center" gap={4} w="100%">
          <Tooltip label={file.original_filename} withArrow multiline w={240}>
            <Text size="xs" fw={500} ta="center" lineClamp={2}>
              {file.original_filename}
            </Text>
          </Tooltip>
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
          onReplace={onReplace}
          onEdit={onEdit}
          onVerify={onVerify}
        />
      ))}
    </SimpleGrid>
  );
}
