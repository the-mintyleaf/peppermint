"use client";

import { Center, Container, Loader, Stack, Text, Title } from "@peppermint/ui";

import { QueryErrorState } from "@/components/QueryErrorState";

import { InvitationCard } from "./components/InvitationCard";
import { useMyInvitations } from "./Invitations.hooks";

export function ModuleInvitations() {
  const { data, isLoading, isError, isRefetching, refetch } =
    useMyInvitations();
  const invitations = data ?? [];

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={2}>Your invitations</Title>
          <Text size="sm" c="dimmed">
            Organizations that have invited you. Accept to join, or decline.
          </Text>
        </Stack>

        {isLoading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : isError ? (
          <QueryErrorState
            message="Couldn't load your invitations."
            onRetry={() => refetch()}
            isRetrying={isRefetching}
          />
        ) : invitations.length === 0 ? (
          <Text size="sm" c="dimmed">
            You have no pending invitations.
          </Text>
        ) : (
          <Stack gap="md">
            {invitations.map((membership) => (
              <InvitationCard key={membership.id} membership={membership} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
