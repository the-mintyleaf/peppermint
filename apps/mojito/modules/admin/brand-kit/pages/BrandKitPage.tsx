"use client";

import {
  Stack,
  Text,
  Paper,
  TextInput,
  Button,
  ColorSwatch,
  ActionIcon,
  SimpleGrid,
  Skeleton,
  Image,
  Group,
  Divider,
  Box,
} from "@zetsel/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { useBrandKit, useUpdateBrandKit } from "../brandKit.hooks";
import type { BrandColor, BrandFont, BrandKit } from "../brandKit.api";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/assets/brand-kit";
const MODULE_INFO = { name: "brand-kit", label: "Brand Kit" };

export function BrandKitPage() {
  const { data, isLoading } = useBrandKit();
  const update = useUpdateBrandKit();
  const [draft, setDraft] = useState<Partial<BrandKit>>({});

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  function setColors(colors: BrandColor[]) {
    setDraft((d) => ({ ...d, colors }));
  }

  function setFonts(fonts: BrandFont[]) {
    setDraft((d) => ({ ...d, fonts }));
  }

  async function handleSave() {
    await update.mutateAsync(draft);
    notifications.show({ message: "Brand kit saved", color: "green" });
  }

  return (
    <ModulePageShell
      basePath={BASE_PATH}
      moduleInfo={MODULE_INFO}
      disableCreateButton
      actions={
        <Button size="xs" loading={update.isPending} onClick={handleSave}>
          Save Changes
        </Button>
      }
    >
      {isLoading ? (
        <Stack gap="md">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={120} radius="md" />)}
        </Stack>
      ) : (
        <Stack gap="xl" style={{ overflow: "auto", height: "calc(100vh - 160px)" }}>
          <Box>
            <Text fw={600} size="sm" mb="md">Logos</Text>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              {[
                { key: "primaryLogoUrl", label: "Primary Logo" },
                { key: "secondaryLogoUrl", label: "Secondary Logo" },
                { key: "darkLogoUrl", label: "Dark Mode Logo" },
              ].map(({ key, label }) => (
                <Stack key={key} gap="xs">
                  <Text size="sm" fw={500}>{label}</Text>
                  {draft[key as keyof BrandKit] ? (
                    <Image
                      src={draft[key as keyof BrandKit] as string}
                      alt={label}
                      h={80}
                      fit="contain"
                      radius="md"
                      style={{ border: "1px solid var(--mantine-color-default-border)" }}
                    />
                  ) : (
                    <Paper withBorder p="xl" radius="md" style={{ textAlign: "center" }}>
                      <Text size="xs" c="dimmed">No logo</Text>
                    </Paper>
                  )}
                  <TextInput
                    size="xs"
                    placeholder="Paste logo URL…"
                    value={(draft[key as keyof BrandKit] as string) ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.currentTarget.value || undefined }))
                    }
                  />
                </Stack>
              ))}
            </SimpleGrid>
          </Box>

          <Divider />

          <Box>
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">Brand Colors</Text>
              <ActionIcon
                size="sm"
                variant="light"
                onClick={() =>
                  setColors([...(draft.colors ?? []), { name: "New Color", hex: "#000000" }])
                }
                aria-label="Add color"
              >
                <PlusIcon size={14} />
              </ActionIcon>
            </Group>
            <Stack gap="sm">
              {(draft.colors ?? []).map((color, i) => (
                <Group key={i} gap="sm">
                  <ColorSwatch color={color.hex} size={24} />
                  <TextInput
                    size="xs"
                    placeholder="Color name"
                    value={color.name}
                    onChange={(e) => {
                      const next = [...(draft.colors ?? [])];
                      next[i] = { ...next[i], name: e.currentTarget.value };
                      setColors(next);
                    }}
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    size="xs"
                    placeholder="#hex"
                    value={color.hex}
                    onChange={(e) => {
                      const next = [...(draft.colors ?? [])];
                      next[i] = { ...next[i], hex: e.currentTarget.value };
                      setColors(next);
                    }}
                    w={100}
                  />
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => setColors((draft.colors ?? []).filter((_, j) => j !== i))}
                    aria-label="Remove color"
                  >
                    <TrashIcon size={12} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">Fonts</Text>
              <ActionIcon
                size="sm"
                variant="light"
                onClick={() => setFonts([...(draft.fonts ?? []), { name: "", weight: "400" }])}
                aria-label="Add font"
              >
                <PlusIcon size={14} />
              </ActionIcon>
            </Group>
            <Stack gap="sm">
              {(draft.fonts ?? []).map((font, i) => (
                <Group key={i} gap="sm">
                  <TextInput
                    size="xs"
                    placeholder="Font family"
                    value={font.name}
                    onChange={(e) => {
                      const next = [...(draft.fonts ?? [])];
                      next[i] = { ...next[i], name: e.currentTarget.value };
                      setFonts(next);
                    }}
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    size="xs"
                    placeholder="Weights (e.g. 400, 700)"
                    value={font.weight ?? ""}
                    onChange={(e) => {
                      const next = [...(draft.fonts ?? [])];
                      next[i] = { ...next[i], weight: e.currentTarget.value };
                      setFonts(next);
                    }}
                    w={160}
                  />
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => setFonts((draft.fonts ?? []).filter((_, j) => j !== i))}
                    aria-label="Remove font"
                  >
                    <TrashIcon size={12} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Text fw={600} size="sm" mb="md">Brand Details</Text>
            <Stack gap="sm" maw={600}>
              <TextInput
                label="Brand Name"
                size="sm"
                value={draft.name ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.currentTarget.value }))}
              />
              <TextInput
                label="Tagline"
                size="sm"
                placeholder="Your brand's tagline…"
                value={draft.tagline ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, tagline: e.currentTarget.value || undefined }))
                }
              />
              <TextInput
                label="Watermark Text"
                size="sm"
                placeholder="© Your Brand"
                value={draft.watermarkText ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, watermarkText: e.currentTarget.value || undefined }))
                }
              />
            </Stack>
          </Box>
        </Stack>
      )}
    </ModulePageShell>
  );
}
