"use client";

import { SimpleGrid, Stack, Text } from "@peppermint/ui";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import type { FileFolderGridProps } from "./FileFolderGrid.types";
import classes from "./FileFolderGrid.module.css";

/**
 * The top level of the files view: one folder per file category that actually
 * has files. Categories are the only grouping the API gives us
 * (`?category=`), and an operator looking for "the passport scan" thinks in
 * exactly those terms — so the folder is the category, and an empty category
 * simply isn't drawn rather than shown as an empty box.
 *
 * A real `<button>`, not a clickable div: Enter and Space have to open a
 * folder, and the focus ring has to be the browser's own.
 */
export function FileFolderGrid({ folders, onOpen }: FileFolderGridProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
      {folders.map((folder) => (
        <button
          key={folder.category}
          type="button"
          className={classes.folder}
          onClick={() => onOpen(folder.category)}
          aria-label={`Open ${folder.label} — ${folder.count} ${
            folder.count === 1 ? "file" : "files"
          }`}
        >
          <Stack align="center" gap={6}>
            <FolderIcon size={40} weight="fill" aria-hidden />
            <Stack align="center" gap={0}>
              <Text size="sm" fw={600} lineClamp={2}>
                {folder.label}
              </Text>
              <Text size="xs" c="dimmed">
                {folder.count} {folder.count === 1 ? "file" : "files"}
              </Text>
            </Stack>
          </Stack>
        </button>
      ))}
    </SimpleGrid>
  );
}
