"use client";

import { Box, Button, Group, Text } from "@peppermint/ui";
import { modals } from "@peppermint/ui";
import { ArrowLeft } from "@phosphor-icons/react";
import { useFormControls } from "../../../../wrappers/FormWrapper/FormWrapper.hooks";
import type { FormShellHeaderProps } from "../../FormShell.types";

export function FormShellHeader({
  title,
  description,
  onBack,
}: FormShellHeaderProps) {
  const { isDirty } = useFormControls();

  const handleBack = () => {
    if (isDirty) {
      modals.openConfirmModal({
        title: <Text size="sm">Leave page?</Text>,
        withCloseButton: false,
        children: (
          <Text size="sm">
            You have unsaved changes. Leaving will discard them.
          </Text>
        ),
        confirmProps: { size: "xs" },
        cancelProps: { size: "xs" },
        labels: { confirm: "Leave", cancel: "Stay" },
        onConfirm: onBack,
        styles: { body: { padding: "var(--mantine-spacing-md)" } },
      });
    } else {
      onBack();
    }
  };

  return (
    <Box
      bg="gray.0"
      style={{
        borderBottom: "1px solid var(--mantine-color-default-border)",
        flexShrink: 0,
      }}
    >
      <Group h={40} px="sm" justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Button
            h={40}
            px="sm"
            radius={0}
            variant="subtle"
            size="xs"
            leftSection={<ArrowLeft size={14} aria-label="Go back" />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Text fw={700} size="xs">
            {title}
          </Text>
          {description && (
            <Text fw={500} size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </Group>
        <Text fw={500} size="xs" c="dimmed" visibleFrom="lg">
          Fill all fields with correct values before submitting.
        </Text>
      </Group>
    </Box>
  );
}
