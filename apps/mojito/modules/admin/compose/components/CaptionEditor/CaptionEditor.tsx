"use client";

import {
  Stack,
  Textarea,
  Text,
  Group,
  Progress,
  Badge,
  Switch,
  Tabs,
} from "@peppermint/ui";
import { useComposeStore } from "../../compose.store";
import { PLATFORM_CHAR_LIMITS, PLATFORM_LABELS } from "../../compose.types";
import type { Platform } from "@/modules/admin/shared/domain.types";

function CaptionProgress({ count, limit }: { count: number; limit: number }) {
  const pct = Math.min((count / limit) * 100, 100);
  const color = pct > 90 ? "red" : pct > 70 ? "yellow" : "blue";
  return (
    <Group gap="xs" justify="flex-end">
      <Progress value={pct} color={color} size="xs" style={{ flex: 1 }} />
      <Text size="xs" c={pct > 90 ? "red" : "dimmed"}>
        {count}/{limit}
      </Text>
    </Group>
  );
}

export function CaptionEditor() {
  const {
    draft,
    variantEditorStates,
    setGlobalCaption,
    setCaption,
    toggleCustomize,
  } = useComposeStore();

  const activePlatforms = Object.keys(variantEditorStates) as Platform[];
  const { perVariantCustomize, globalCaption } = draft;

  if (activePlatforms.length === 0) {
    return (
      <Stack gap="xs">
        <Textarea
          label="Caption"
          placeholder="Select channels to start composing…"
          disabled
          autosize
          minRows={4}
        />
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Caption
        </Text>
        {activePlatforms.length > 1 && (
          <Switch
            size="xs"
            label="Customize per platform"
            checked={perVariantCustomize}
            onChange={toggleCustomize}
          />
        )}
      </Group>

      {!perVariantCustomize ? (
        <Stack gap="xs">
          <Textarea
            placeholder="Write a caption for all platforms…"
            value={globalCaption}
            onChange={(e) => setGlobalCaption(e.currentTarget.value)}
            autosize
            minRows={4}
            maxRows={10}
          />
          {activePlatforms.map((p) => {
            const limit = PLATFORM_CHAR_LIMITS[p];
            const count = globalCaption.length;
            return (
              count > limit * 0.7 && (
                <Badge
                  key={p}
                  size="xs"
                  color={count > limit ? "red" : "yellow"}
                  variant="light"
                >
                  {PLATFORM_LABELS[p]}: {count}/{limit}
                </Badge>
              )
            );
          })}
        </Stack>
      ) : (
        <Tabs defaultValue={activePlatforms[0]}>
          <Tabs.List>
            {activePlatforms.map((p) => {
              const state = variantEditorStates[p];
              return (
                <Tabs.Tab
                  key={p}
                  value={p}
                  rightSection={
                    !state?.isValid ? (
                      <Badge size="xs" color="red" circle>
                        !
                      </Badge>
                    ) : undefined
                  }
                >
                  {PLATFORM_LABELS[p]}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
          {activePlatforms.map((p) => {
            const state = variantEditorStates[p];
            const limit = PLATFORM_CHAR_LIMITS[p];
            return (
              <Tabs.Panel key={p} value={p} pt="sm">
                <Stack gap="xs">
                  <Textarea
                    placeholder={`Caption for ${PLATFORM_LABELS[p]}…`}
                    value={state?.caption ?? ""}
                    onChange={(e) => setCaption(p, e.currentTarget.value)}
                    autosize
                    minRows={4}
                    maxRows={10}
                    error={state?.errors[0]}
                  />
                  <CaptionProgress
                    count={state?.characterCount ?? 0}
                    limit={limit}
                  />
                </Stack>
              </Tabs.Panel>
            );
          })}
        </Tabs>
      )}
    </Stack>
  );
}
