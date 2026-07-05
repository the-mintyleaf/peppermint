"use client";

import { Alert, Button, Group, Text } from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import type { QueryErrorStateProps } from "./QueryErrorState.types";

export function QueryErrorState({
  message,
  onRetry,
  isRetrying,
}: QueryErrorStateProps) {
  return (
    <Alert
      color="red"
      icon={<WarningIcon size={18} weight="fill" aria-hidden />}
    >
      <Group justify="space-between" align="center" gap="sm">
        <Text size="sm">{message}</Text>
        <Button
          size="compact-sm"
          variant="light"
          color="red"
          onClick={onRetry}
          loading={isRetrying}
        >
          Retry
        </Button>
      </Group>
    </Alert>
  );
}
