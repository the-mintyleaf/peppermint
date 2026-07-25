"use client";

import { Center, Skeleton, Stack, Text } from "@peppermint/ui";
import { QueryErrorState } from "@/components/QueryErrorState";
import type { SectionStateProps } from "./SectionState.types";

/**
 * Shared loading/error/empty chrome for the eight dashboard sections. Each
 * section still owns its own `useQuery` (never combined — CONCEPT.md "every
 * section loads independently"); this only de-duplicates the four-state
 * render fan-out every one of them needs, so a mistake in the "has_more, not
 * length" or "empty is healthy" rules only has one place to happen.
 */
export function SectionState({
  isPending,
  isError,
  errorMessage,
  onRetry,
  isRetrying,
  isEmpty,
  emptyMessage,
  skeletonHeight = 120,
  children,
}: SectionStateProps) {
  if (isPending) {
    return <Skeleton height={skeletonHeight} radius="md" />;
  }

  if (isError) {
    return (
      <QueryErrorState
        message={errorMessage}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  if (isEmpty) {
    return (
      <Center p="lg">
        <Stack align="center" gap={2}>
          <Text size="sm" c="dimmed">
            {emptyMessage ?? "Nothing here right now."}
          </Text>
        </Stack>
      </Center>
    );
  }

  return <>{children}</>;
}
