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
import { useKeywords, useAddKeyword, useDeleteKeyword } from "../../listening.hooks";
import type { Keyword } from "../../../shared/entities.types";

function VolumeChart({ series }: { series: Keyword["volumeSeries"] }) {
  const data = series.map((p) => ({
    date: p.date instanceof Date ? p.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : p.date,
    volume: p.value,
  }));
  return (
    <LineChart
      h={100}
      data={data}
      dataKey="date"
      series={[{ name: "volume", color: "blue", label: "Volume" }]}
      curveType="natural"
      withDots={false}
    />
  );
}

export function KeywordsList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [kind, setKind] = useState<"keyword" | "hashtag">("keyword");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: keywords = [], isLoading } = useKeywords();
  const add = useAddKeyword();
  const remove = useDeleteKeyword();

  async function handleAdd() {
    if (!term.trim()) return;
    await add.mutateAsync({ term: term.trim(), kind });
    notifications.show({ message: "Keyword added", color: "green" });
    setTerm("");
    setModalOpen(false);
  }

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Keywords & Hashtags</Title>
            <Text c="dimmed" size="sm">Track keyword and hashtag volume trends over time</Text>
          </Stack>
          <Button size="sm" leftSection={<PlusIcon size={14} />} onClick={() => setModalOpen(true)}>
            Add Keyword
          </Button>
        </Group>
      </Paper>

      {isLoading ? (
        <Stack gap="xs">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={52} radius="md" />)}
        </Stack>
      ) : keywords.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed" size="sm">No keywords tracked — add one to get started</Text>
        </Center>
      ) : (
        <Paper withBorder radius="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Term</Table.Th>
                <Table.Th>Kind</Table.Th>
                <Table.Th>Trend</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {keywords.map((kw) => (
                <>
                  <Table.Tr key={kw.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{kw.term}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="xs" variant="light" color={kw.kind === "hashtag" ? "violet" : "blue"}>
                        {kw.kind}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {kw.volumeSeries[kw.volumeSeries.length - 1]?.value ?? 0} today
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={() => setExpanded(expanded === kw.id ? null : kw.id)}
                          aria-label={expanded === kw.id ? "Collapse chart" : "Expand chart"}
                        >
                          {expanded === kw.id ? <CaretUpIcon size={14} /> : <CaretDownIcon size={14} />}
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => remove.mutate(kw.id)}
                          aria-label="Delete keyword"
                        >
                          <TrashIcon size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                  {expanded === kw.id && (
                    <Table.Tr key={`${kw.id}-chart`}>
                      <Table.Td colSpan={4}>
                        <Collapse in>
                          <VolumeChart series={kw.volumeSeries} />
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

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Keyword" size="sm">
        <Stack gap="md">
          <TextInput
            label="Term"
            placeholder="brand awareness"
            value={term}
            onChange={(e) => setTerm(e.currentTarget.value)}
          />
          <Select
            label="Kind"
            data={[
              { label: "Keyword", value: "keyword" },
              { label: "Hashtag", value: "hashtag" },
            ]}
            value={kind}
            onChange={(v) => setKind((v as "keyword" | "hashtag") ?? "keyword")}
          />
          <Button fullWidth loading={add.isPending} disabled={!term.trim()} onClick={handleAdd}>
            Add
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
