"use client";

import { Stack, Group, Title, Text, Paper, Skeleton, Table, Badge, Progress } from "@peppermint/ui";
import { BarChart } from "@peppermint/ui";
import { useQuery } from "@tanstack/react-query";
import { fetchROI } from "../../analytics.api";
import { analyticsQueryKeys } from "../../analytics.queryKeys";

export function ROI() {
  const { data, isLoading } = useQuery({
    queryKey: analyticsQueryKeys.roi("30d"),
    queryFn: () => fetchROI("30d"),
  });

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>ROI / Attribution</Title>
            <Text c="dimmed" size="sm">Measure return on investment and content attribution</Text>
          </Stack>
        </Group>
      </Paper>

      {isLoading ? (
        <><Skeleton h={200} radius="md" /><Skeleton h={200} radius="md" /></>
      ) : data ? (
        <>
          <Paper withBorder radius="md" p="md">
            <Text fw={500} size="sm" mb="md">Conversion Funnel</Text>
            <Stack gap="xs">
              {data.funnel.map((stage, i) => {
                const pct = Math.round((stage.value / data.funnel[0].value) * 100);
                return (
                  <Group key={stage.stage} gap="sm">
                    <Text size="sm" w={100}>{stage.stage}</Text>
                    <Progress value={pct} color="blue" style={{ flex: 1 }} />
                    <Text size="sm" w={80} ta="right">{stage.value.toLocaleString()}</Text>
                    <Text size="xs" c="dimmed" w={40}>{pct}%</Text>
                  </Group>
                );
              })}
            </Stack>
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Text fw={500} size="sm" mb="sm">Campaign ROI</Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Campaign</Table.Th>
                  <Table.Th>Spend</Table.Th>
                  <Table.Th>Revenue</Table.Th>
                  <Table.Th>ROI</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.campaigns.map((c) => (
                  <Table.Tr key={c.name}>
                    <Table.Td><Text size="sm">{c.name}</Text></Table.Td>
                    <Table.Td><Text size="sm">${c.spend.toLocaleString()}</Text></Table.Td>
                    <Table.Td><Text size="sm">${c.revenue.toLocaleString()}</Text></Table.Td>
                    <Table.Td>
                      <Badge color={c.roi > 150 ? "green" : c.roi > 50 ? "yellow" : "red"} variant="light">
                        {c.roi}%
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </>
      ) : null}
    </Stack>
  );
}
