"use client";

import { useEffect, useCallback } from "react";
import {
  Box,
  Group,
  Button,
  Select,
  Text,
  ActionIcon,
  Tooltip,
  Stack,
  Paper,
} from "@zetsel/ui";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBuilderStore } from "./TemplateBuilder.store";
import { Canvas } from "./components/Canvas";
import { ElementPalette } from "./components/ElementPalette";
import { Inspector } from "./components/Inspector";
import { serializeCanvas, extractSlots } from "./canvas.utils";
import { createTemplate, updateTemplate, PLATFORM_LABELS } from "../module.api";
import type { PlatformFormat } from "../module.api";

interface TemplateBuilderProps {
  templateId?: string;
}

export function TemplateBuilder({ templateId }: TemplateBuilderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    templateMeta,
    elements,
    isDirty,
    previewMode,
    setPlatform,
    setPreviewMode,
    undo,
    redo,
    clearDirty,
    historyIndex,
    history,
  } = useBuilderStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key === "z") { e.preventDefault(); redo(); }
      else if (mod && e.key === "z") { e.preventDefault(); undo(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const html = serializeCanvas(templateMeta, elements);
      const slots = extractSlots(elements);
      const payload = {
        name: templateMeta.name,
        description: templateMeta.description,
        platform: templateMeta.platform,
        width: templateMeta.width,
        height: templateMeta.height,
        html,
        slots,
      };
      if (templateId) return updateTemplate(templateId, payload);
      return createTemplate(payload);
    },
    onSuccess: (savedTemplate) => {
      clearDirty();
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      if (!templateId) {
        router.replace(`/admin/content/templates/${savedTemplate.id}/edit`);
      }
    },
  });

  function handleDiscard() {
    if (isDirty) {
      if (!confirm("Discard unsaved changes?")) return;
    }
    router.push("/admin/content/templates");
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Top bar */}
      <Group
        gap="sm"
        justify="space-between"
        p="xs"
        style={{ borderBottom: "1px solid var(--mantine-color-default-border)", flexShrink: 0 }}
      >
        <Group gap="sm">
          <Text size="sm" fw={600} maw={200} truncate>
            {templateMeta.name}
          </Text>
          <Select
            value={templateMeta.platform}
            onChange={(v) => v && setPlatform(v as PlatformFormat)}
            data={Object.entries(PLATFORM_LABELS).map(([value, label]) => ({ value, label }))}
            size="xs"
            w={160}
          />
        </Group>

        <Group gap="xs">
          <Tooltip label="Undo (⌘Z)" withArrow>
            <ActionIcon size="sm" variant="subtle" onClick={undo} disabled={!canUndo} aria-label="Undo">
              <ArrowCounterClockwiseIcon size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Redo (⌘⇧Z)" withArrow>
            <ActionIcon size="sm" variant="subtle" onClick={redo} disabled={!canRedo} aria-label="Redo">
              <ArrowClockwiseIcon size={14} />
            </ActionIcon>
          </Tooltip>

          <Button
            size="xs"
            variant="subtle"
            leftSection={previewMode ? <EyeSlashIcon size={13} /> : <EyeIcon size={13} />}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Edit" : "Preview"}
          </Button>

          <Button
            size="xs"
            leftSection={<FloppyDiskIcon size={13} />}
            onClick={() => save()}
            loading={isSaving}
            disabled={!isDirty}
          >
            Save
          </Button>

          <Button
            size="xs"
            variant="subtle"
            color="gray"
            leftSection={<XIcon size={13} />}
            onClick={handleDiscard}
          >
            Discard
          </Button>
        </Group>
      </Group>

      {/* Three-panel body */}
      <Box style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <ElementPalette />
        <Canvas />
        <Inspector />
      </Box>
    </Box>
  );
}
