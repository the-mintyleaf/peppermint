"use client";

import { Container } from "@peppermint/ui";

import { QueryErrorState } from "@/components/QueryErrorState";

import type { InvitationsErrorProps } from "./InvitationsError.types";

/** Module-level error fallback for the invitations route (wired via error.tsx). */
export function InvitationsError({ onRetry }: InvitationsErrorProps) {
  return (
    <Container size="sm" py="xl">
      <QueryErrorState
        message="Something went wrong loading your invitations."
        onRetry={onRetry}
        isRetrying={false}
      />
    </Container>
  );
}
