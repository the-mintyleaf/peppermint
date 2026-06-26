"use client";

import { useEffect, useCallback, useState } from "react";
import {
  Box,
  Group,
  Button,
  ActionIcon,
  Tooltip,
  Text,
  Divider,
} from "@peppermint/ui";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { SlidersHorizontalIcon } from "@phosphor-icons/react/dist/csr/SlidersHorizontal";
import { useRouter } from "next/navigation";
import { CollapsedPanelBubble } from "./components/CollapsedPanelBubble/CollapsedPanelBubble";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBuilderStore } from "./TemplateBuilder.store";
import { Canvas } from "./components/Canvas";
import { LayersPanel } from "./components/LayersPanel";
import { Inspector } from "./components/Inspector";
import { serializeCanvas, extractSlots } from "./canvas.utils";
import { INSPECTOR_PANEL_WIDTH, LAYERS_PANEL_WIDTH } from "./panel.constants";
import { createTemplate, updateTemplate } from "../module.api";

interface TemplateBuilderProps {
  templateId?: string;
}

export function TemplateBuilder({ templateId }: TemplateBuilderProps) {
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showInspectorPanel, setShowInspectorPanel] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    templateMeta,
    elements,
    isDirty,
    previewMode,
    setPreviewMode,
    undo,
    redo,
    clearDirty,
    historyIndex,
    history,
  } = useBuilderStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const templateLabel = templateId ? templateMeta.name : "New";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key === "z") {
        e.preventDefault();
        redo();
      } else if (mod && e.key === "z") {
        e.preventDefault();
        undo();
      }
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
        router.replace(`/admin/automation/templates/${savedTemplate.id}/edit`);
      }
    },
  });

  const handleDiscard = useCallback(() => {
    if (isDirty) {
      if (!confirm("Discard unsaved changes?")) return;
    }
    router.push("/admin/automation/templates");
  }, [isDirty, router]);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Group
        gap={4}
        justify="space-between"
        px="sm"
        wrap="nowrap"
        align="center"
        style={{
          height: 40,
          minHeight: 40,
          maxHeight: 40,
          boxSizing: "border-box",
          borderBottom: "1px solid var(--mantine-color-default-border)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <Text size="xs" fw={600} truncate style={{ minWidth: 0, flex: 1 }}>
          <Text component="span" c="brand" inherit>
            Mojito
          </Text>
          {" Template Builder | "}
          {templateLabel}
        </Text>

        <Group gap={4} wrap="nowrap" align="center">
          <Tooltip label="Undo (⌘Z)" withArrow>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <ArrowCounterClockwiseIcon size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Redo (⌘⇧Z)" withArrow>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
            >
              <ArrowClockwiseIcon size={14} />
            </ActionIcon>
          </Tooltip>

          <Divider orientation="vertical" />

          <Button
            size="xs"
            variant="subtle"
            leftSection={
              previewMode ? <EyeSlashIcon size={14} /> : <EyeIcon size={14} />
            }
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Edit" : "Preview"}
          </Button>

          <Button
            size="xs"
            leftSection={<FloppyDiskIcon size={14} />}
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
            leftSection={<XIcon size={14} />}
            onClick={handleDiscard}
          >
            Discard
          </Button>
        </Group>
      </Group>

      <Box style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {showLayersPanel && (
          <Box
            style={{
              width: LAYERS_PANEL_WIDTH,
              borderRight: "1px solid var(--mantine-color-default-border)",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <LayersPanel onCollapse={() => setShowLayersPanel(false)} />
          </Box>
        )}

        <Box
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            position: "relative",
            display: "flex",
          }}
        >
          <Canvas />
          {!showLayersPanel && (
            <CollapsedPanelBubble
              side="left"
              width={LAYERS_PANEL_WIDTH}
              label="Layers"
              icon={
                <StackIcon
                  size={14}
                  weight="fill"
                  color="var(--mantine-color-brand-6)"
                />
              }
              onExpand={() => setShowLayersPanel(true)}
              expandLabel="Show layers"
            />
          )}
          {!showInspectorPanel && (
            <CollapsedPanelBubble
              side="right"
              width={INSPECTOR_PANEL_WIDTH}
              label="Properties"
              icon={
                <SlidersHorizontalIcon
                  size={14}
                  weight="fill"
                  color="var(--mantine-color-dimmed)"
                />
              }
              onExpand={() => setShowInspectorPanel(true)}
              expandLabel="Show properties"
            />
          )}
        </Box>

        {showInspectorPanel && (
          <Box
            style={{
              width: INSPECTOR_PANEL_WIDTH,
              borderLeft: "1px solid var(--mantine-color-default-border)",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <Inspector onCollapse={() => setShowInspectorPanel(false)} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
