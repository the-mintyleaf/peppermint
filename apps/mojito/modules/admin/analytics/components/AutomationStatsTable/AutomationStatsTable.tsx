"use client";

import { Table, Text, Badge, Group } from "@zetsel/ui";
import { useRouter } from "next/navigation";
import type { AutomationStatRow } from "../../Analytics.types";

interface AutomationStatsTableProps {
  rows: AutomationStatRow[];
}

function successColor(rate: number): string {
  if (rate >= 90) return "green";
  if (rate >= 70) return "yellow";
  return "red";
}

export function AutomationStatsTable({ rows }: AutomationStatsTableProps) {
  const router = useRouter();

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders fz="xs">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Automation</Table.Th>
          <Table.Th>Runs</Table.Th>
          <Table.Th>Success Rate</Table.Th>
          <Table.Th>Content Volume</Table.Th>
          <Table.Th>Avg Duration (s)</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          <Table.Tr
            key={row.id}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/admin/automation/workflows/${row.id}`)}
          >
            <Table.Td>
              <Text size="xs" fw={500}>
                {row.name}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="xs">{row.runs}</Text>
            </Table.Td>
            <Table.Td>
              <Group gap={4}>
                <Badge size="xs" color={successColor(row.successRate)}>
                  {row.successRate}%
                </Badge>
              </Group>
            </Table.Td>
            <Table.Td>
              <Text size="xs">{row.contentVolume}</Text>
            </Table.Td>
            <Table.Td>
              <Text size="xs">{row.avgDuration}s</Text>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
