"use client";

import {
  Stack,
  Text,
  Paper,
  SimpleGrid,
  Image,
  ActionIcon,
  Button,
  FileButton,
  TextInput,
  Select,
  Skeleton,
  Center,
  Checkbox,
  Pagination,
  NavLink,
  Group,
} from "@zetsel/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useMedia, useFolders, useUploadMedia, useDeleteMedia, useBulkDeleteMedia } from "../../media.hooks";
import type { MediaFilters } from "../../media.api";
import type { MediaAsset } from "../../../shared/entities.types";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/assets/media";
const MODULE_INFO = { name: "media", label: "Media Library" };

interface MediaCardProps {
  asset: MediaAsset;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function MediaCard({ asset, selected, onToggle, onDelete }: MediaCardProps) {
  return (
    <Paper
      withBorder
      radius="md"
      style={{
        position: "relative",
        cursor: "pointer",
        outline: selected ? "2px solid var(--mantine-color-blue-4)" : undefined,
      }}
    >
      <div style={{ position: "relative" }}>
        <Image src={asset.thumbnailUrl ?? asset.url} alt={asset.alt} height={140} fit="cover" radius="md" />
        {asset.kind === "video" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.3)",
              borderRadius: 8,
            }}
          >
            <PlayIcon size={24} color="white" />
          </div>
        )}
        <Checkbox
          size="xs"
          checked={selected}
          onChange={onToggle}
          style={{ position: "absolute", top: 6, left: 6 }}
          aria-label={`Select ${asset.alt}`}
        />
        <ActionIcon
          size="xs"
          variant="filled"
          color="red"
          style={{ position: "absolute", top: 6, right: 6 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete asset"
        >
          <TrashIcon size={10} />
        </ActionIcon>
      </div>
      <Text size="xs" p="xs" truncate>{asset.alt}</Text>
    </Paper>
  );
}

export function MediaLibrary() {
  const [filters, setFilters] = useState<MediaFilters>({ page: 1, pageSize: 20 });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: foldersData = [] } = useFolders();
  const { data, isLoading } = useMedia(filters);
  const upload = useUploadMedia();
  const remove = useDeleteMedia();
  const bulkRemove = useBulkDeleteMedia();

  const assets = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const pageCount = Math.ceil(total / (filters.pageSize ?? 20));

  function update(patch: Partial<MediaFilters>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
    setSelected(new Set());
  }

  async function handleUpload(files: File[]) {
    for (const file of files) {
      await upload.mutateAsync({ file, folderId: filters.folderId });
    }
    notifications.show({ message: `${files.length} file(s) uploaded`, color: "green" });
  }

  async function handleBulkDelete() {
    await bulkRemove.mutateAsync([...selected]);
    setSelected(new Set());
    notifications.show({ message: "Files deleted", color: "green" });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <ModulePageShell
      basePath={BASE_PATH}
      moduleInfo={MODULE_INFO}
      disableCreateButton
      actions={
        <Group gap="sm">
          {selected.size > 0 && (
            <Button
              size="xs"
              color="red"
              variant="light"
              leftSection={<TrashIcon size={12} />}
              loading={bulkRemove.isPending}
              onClick={handleBulkDelete}
            >
              Delete {selected.size}
            </Button>
          )}
          <FileButton multiple onChange={handleUpload} accept="image/*,video/*">
            {(props) => (
              <Button
                size="xs"
                leftSection={<UploadSimpleIcon size={14} />}
                loading={upload.isPending}
                {...props}
              >
                Upload
              </Button>
            )}
          </FileButton>
        </Group>
      }
    >
      <Group gap={0} align="flex-start" style={{ height: "calc(100vh - 160px)" }}>
        <div
          style={{
            width: 200,
            borderRight: "1px solid var(--mantine-color-default-border)",
            flexShrink: 0,
            alignSelf: "stretch",
          }}
        >
          <NavLink
            label="All Files"
            leftSection={<FolderIcon size={14} />}
            active={!filters.folderId}
            onClick={() => update({ folderId: undefined })}
          />
          {foldersData.map((f) => (
            <NavLink
              key={f.id}
              label={f.name}
              leftSection={<FolderIcon size={14} />}
              active={filters.folderId === f.id}
              onClick={() => update({ folderId: f.id })}
            />
          ))}
        </div>

        <Stack style={{ flex: 1, overflow: "auto" }} gap="md">
          <Group gap="sm">
            <TextInput
              style={{ flex: 1 }}
              size="xs"
              placeholder="Search assets…"
              leftSection={<MagnifyingGlassIcon size={14} />}
              value={filters.search ?? ""}
              onChange={(e) => update({ search: e.currentTarget.value || undefined })}
            />
            <Select
              size="xs"
              w={120}
              placeholder="Type"
              clearable
              data={[
                { label: "Images", value: "image" },
                { label: "Videos", value: "video" },
              ]}
              value={filters.kind ?? null}
              onChange={(v) => update({ kind: (v as MediaFilters["kind"]) ?? undefined })}
            />
          </Group>

          {isLoading ? (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
              {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} h={180} radius="md" />)}
            </SimpleGrid>
          ) : assets.length === 0 ? (
            <Center py="xl">
              <Text c="dimmed" size="sm">No assets found — upload some files</Text>
            </Center>
          ) : (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
              {assets.map((asset) => (
                <MediaCard
                  key={asset.id}
                  asset={asset}
                  selected={selected.has(asset.id)}
                  onToggle={() => toggleSelect(asset.id)}
                  onDelete={async () => {
                    await remove.mutateAsync(asset.id);
                    notifications.show({ message: "File deleted", color: "green" });
                  }}
                />
              ))}
            </SimpleGrid>
          )}

          {pageCount > 1 && (
            <Group justify="center">
              <Pagination
                size="sm"
                total={pageCount}
                value={filters.page ?? 1}
                onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
              />
            </Group>
          )}
        </Stack>
      </Group>
    </ModulePageShell>
  );
}
