"use client";

import { Alert, Stack, Text } from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { useComposeStore } from "../../compose.store";
import { PLATFORM_LABELS } from "../../compose.types";
import type { Platform } from "@/modules/admin/shared/domain.types";

export function ValidationBanner() {
  const { draft, variantEditorStates } = useComposeStore();

  const errors: string[] = [];

  if (draft.selectedChannelIds.length === 0) {
    errors.push("Select at least one channel before publishing.");
  }

  if (!draft.globalCaption && !draft.perVariantCustomize) {
    errors.push("Caption is required.");
  }

  const platformErrors = Object.entries(variantEditorStates)
    .filter(([, state]) => !state.isValid)
    .map(([platform]) => `${PLATFORM_LABELS[platform as Platform]} caption exceeds character limit.`);

  const allErrors = [...errors, ...platformErrors];

  if (allErrors.length === 0) return null;

  return (
    <Alert icon={<WarningIcon size={16} />} color="orange" variant="light" radius="sm">
      <Stack gap={2}>
        {allErrors.map((e, i) => (
          <Text key={i} size="xs">
            {e}
          </Text>
        ))}
      </Stack>
    </Alert>
  );
}
