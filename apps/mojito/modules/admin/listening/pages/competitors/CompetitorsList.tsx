"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Badge,
  Button,
  ActionIcon,
  Table,
  TextInput,
  Select,
  Modal,
  Skeleton,
  Center,
  Collapse,
} from "@zetsel/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { LineChart } from "@zetsel/ui";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useCompetitors, useAddCompetitor, useDeleteCompetitor } from "../../listening.hooks";
import type { Competitor } from "../../../shared/entities.types";

const PLATFORMS = ["instagram", "x", "linkedin", "tiktok", "facebook"];

function VolumeSeries({ series }: { series: Competitor["volumeSeries"] }) {
  const data = series.map((p) => ({
    date: p.date instanceof Date ? p.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : p.date,
    volume: p.value,
  }));
  return (
    <LineChart
      h={100}
      data={data}
      dataKey="date"
      series={[{ name: "volume", color: "red", label: "Mentions" }]}
      curveType="natural"
      withDots={false}
    />
  );
}

export function CompetitorsList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: competitors = [], isLoading } = useCompetitors();
  const add = useAddCompetitor();
  const remove = useDeleteCompetitor();

  async function handleAdd() {
    if (!handle.trim()) return;
    await add.mutateAsync({ handle: handle.trim(), platform });
    notifications.show({ message: "Competitor added", color: "green" });
    setHandle("");
    setModalOpen(false);
  }

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Competitors</Title>
            <Text c="dimmed" size="sm">Monitor competitor handles and compare volume trends</Text>
          </Stack>
          <Button size="sm" leftSection={<PlusIcon size={14} />} onClick={() => setModalOpen(true)}>
            Add Competitor
          </Button>
        </Group>
      </Paper>

      {isLoading ? (
        <Stack gap="xs">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={52} radius="md" />)}
        </Stack>
      ) : competitors.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed" size="sm">No competitors tracked — add one to start monitoring</Text>
        </Center>
      ) : (
        <Paper withBorder radius="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Handle</Table.Th>
                <Table.Th>Platform</Table.Th>
                <Table.Th>Today's Volume</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {competitors.map((c) => (
                <>
                  <Table.Tr key={c.id}>
                    <Table.Td><Text size="sm" fw={500}>{c.handle}</Text></Table.Td>
                    <Table.Td>
                      <Badge size="xs" variant="light">{c.platform}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {c.volumeSeries[c.volumeSeries.length - 1]?.value ?? 0}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                          aria-label={expanded === c.id ? "Collapse chart" : "Expand chart"}
                        >
                          {expanded === c.id ? <CaretUpIcon size={14} /> : <CaretDownIcon size={14} />}
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => remove.mutate(c.id)}
                          aria-label="Remove competitor"
                        >
                          <TrashIcon size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                  {expanded === c.id && (
                    <Table.Tr key={`${c.id}-chart`}>
                      <Table.Td colSpan={4}>
                        <Collapse in>
                          <VolumeSeries series={c.volumeSeries} />
                        </Collapse>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Competitor" size="sm">
        <Stack gap="md">
          <TextInput
            label="Handle"
            placeholder="@competitor_brand"
            value={handle}
            onChange={(e) => setHandle(e.currentTarget.value)}
          />
          <Select
            label="Platform"
            data={PLATFORMS.map((p) => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))}
            value={platform}
            onChange={(v) => setPlatform(v ?? "instagram")}
          />
          <Button fullWidth loading={add.isPending} disabled={!handle.trim()} onClick={handleAdd}>
            Add
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
