"use client";

import {
  Stack,
  Group,
  Text,
  Divider,
  Loader,
  Center,
  SimpleGrid,
} from "@peppermint/ui";
import { useQuery } from "@tanstack/react-query";
import { AutomationDAG } from "./components/AutomationDAG";
import { AutomationControls } from "./components/AutomationControls";
import { RunHistory } from "./components/RunHistory";
import { fetchAutomation, type Automation } from "../../module.api";

interface AutomationViewProps {
  automationId: string;
}

export function AutomationView({ automationId }: AutomationViewProps) {
  const { data: automation, isLoading } = useQuery({
    queryKey: ["automation", automationId],
    queryFn: () => fetchAutomation(automationId),
    refetchInterval: (query: { state: { data: Automation | undefined } }) => {
      return query.state.data?.status === "running" ? 5_000 : false;
    },
  });

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (!automation) {
    return (
      <Center h={300}>
        <Text c="dimmed">Automation not found.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Text size="lg" fw={600}>
          {automation.name}
        </Text>
        <Text size="sm" c="dimmed">
          {automation.description}
        </Text>
      </Stack>

      {automation.nodes && automation.edges && (
        <AutomationDAG nodes={automation.nodes} edges={automation.edges} />
      )}

      <Divider />

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Stack gap="xs" style={{ gridColumn: "1 / 3" }}>
          <Text size="sm" fw={500}>
            Run History
          </Text>
          <RunHistory automationId={automationId} />
        </Stack>
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Controls
          </Text>
          <AutomationControls automation={automation} />
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
