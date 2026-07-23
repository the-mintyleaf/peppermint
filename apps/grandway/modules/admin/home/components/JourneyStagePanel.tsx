"use client";

import Link from "next/link";
import { Button, SimpleGrid, Stack, Text } from "@peppermint/ui";
import { HandshakeIcon } from "@phosphor-icons/react/dist/csr/Handshake";
import { AirplaneTiltIcon } from "@phosphor-icons/react/dist/csr/AirplaneTilt";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { useJourneyAttentionCounts } from "../home.hooks";
import { StatTile } from "./StatTile";

/**
 * Answers "what needs attention in the journey pipeline?" — Offer Stage and
 * Visa Stage are the two time-sensitive active stages (a decision is pending
 * or a visa step is underway); the other five active stages are ordinary
 * in-progress work, not exceptions worth a Home tile.
 */
export function JourneyStagePanel() {
  const { offerStage, visaStage } = useJourneyAttentionCounts();

  return (
    <Stack gap="sm">
      <Text size="sm" fw={600}>
        Journeys needing attention
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <StatTile
          label="Offer Stage"
          count={offerStage.count}
          isLoading={offerStage.isLoading}
          isError={offerStage.isError}
          color="indigo"
          icon={
            <HandshakeIcon
              size={20}
              color="var(--mantine-color-indigo-6)"
              aria-hidden
            />
          }
        />
        <StatTile
          label="Visa Stage"
          count={visaStage.count}
          isLoading={visaStage.isLoading}
          isError={visaStage.isError}
          color="violet"
          icon={
            <AirplaneTiltIcon
              size={20}
              color="var(--mantine-color-violet-6)"
              aria-hidden
            />
          }
        />
      </SimpleGrid>
      <Button
        component={Link}
        href="/admin/applicant-journeys"
        variant="subtle"
        size="xs"
        rightSection={<ArrowRightIcon size={14} aria-hidden />}
      >
        View journey worklist
      </Button>
    </Stack>
  );
}
