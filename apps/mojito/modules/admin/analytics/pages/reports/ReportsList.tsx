"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  SimpleGrid,
  Button,
  Badge,
  ActionIcon,
  Modal,
  Checkbox,
  TextInput,
  Select,
  Skeleton,
  Center,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  fetchReports,
  createReport,
  deleteReport,
  exportReport,
} from "../../analytics.api";
import { analyticsQueryKeys } from "../../analytics.queryKeys";
import type { Report } from "../../analytics.api";

const DEFAULT_SECTIONS = [
  { id: "overview", name: "Overview" },
  { id: "channels", name: "Channel Performance" },
  { id: "audience", name: "Audience" },
  { id: "sentiment", name: "Sentiment" },
  { id: "roi", name: "ROI / Attribution" },
];

function ReportCard({
  report,
  onExport,
  onDelete,
}: {
  report: Report;
  onExport: (id: string, fmt: "pdf" | "csv") => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600} size="sm" lineClamp={1}>
            {report.name}
          </Text>
          {report.schedule && (
            <Badge size="xs" variant="light" color="blue">
              {report.schedule.frequency}
            </Badge>
          )}
        </Group>
        <Text size="xs" c="dimmed">
          {report.range.from} – {report.range.to}
        </Text>
        <Text size="xs" c="dimmed">
          {report.sections.filter((s) => s.enabled).length} sections
        </Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            leftSection={<DownloadSimpleIcon size={12} />}
            onClick={() => onExport(report.id, "pdf")}
          >
            PDF
          </Button>
          <Button
            size="xs"
            variant="light"
            leftSection={<DownloadSimpleIcon size={12} />}
            onClick={() => onExport(report.id, "csv")}
          >
            CSV
          </Button>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            ml="auto"
            onClick={() => onDelete(report.id)}
            aria-label="Delete report"
          >
            <TrashIcon size={14} />
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  );
}

export function ReportsList() {
  const qc = useQueryClient();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [name, setName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sections, setSections] = useState<string[]>(["overview", "channels"]);
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: analyticsQueryKeys.reports(),
    queryFn: fetchReports,
  });

  const create = useMutation({
    mutationFn: () =>
      createReport({
        name,
        range: { from: fromDate, to: toDate },
        sections: DEFAULT_SECTIONS.map((s) => ({
          ...s,
          enabled: sections.includes(s.id),
        })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: analyticsQueryKeys.reports() });
      notifications.show({ message: "Report created", color: "green" });
      setBuilderOpen(false);
      setName("");
    },
  });

  const remove = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: analyticsQueryKeys.reports() });
      notifications.show({ message: "Report deleted", color: "green" });
    },
  });

  async function handleExport(id: string, format: "pdf" | "csv") {
    setExporting(id);
    try {
      await exportReport(id, format);
    } finally {
      setExporting(null);
    }
  }

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Reports</Title>
            <Text c="dimmed" size="sm">
              Create, schedule, and export analytics reports
            </Text>
          </Stack>
          <Button
            size="sm"
            leftSection={<PlusIcon size={14} />}
            onClick={() => setBuilderOpen(true)}
          >
            New Report
          </Button>
        </Group>
      </Paper>

      {isLoading ? (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} h={160} radius="md" />
          ))}
        </SimpleGrid>
      ) : reports.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed" size="sm">
            No reports yet — create your first one
          </Text>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              onExport={handleExport}
              onDelete={(id) => remove.mutate(id)}
            />
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={builderOpen}
        onClose={() => setBuilderOpen(false)}
        title="New Report"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Report Name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Monthly Summary"
          />
          <Group grow>
            <TextInput
              label="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.currentTarget.value)}
            />
            <TextInput
              label="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.currentTarget.value)}
            />
          </Group>
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Sections
            </Text>
            {DEFAULT_SECTIONS.map((s) => (
              <Checkbox
                key={s.id}
                label={s.name}
                checked={sections.includes(s.id)}
                onChange={(e) => {
                  setSections((prev) =>
                    e.currentTarget.checked
                      ? [...prev, s.id]
                      : prev.filter((x) => x !== s.id),
                  );
                }}
              />
            ))}
          </Stack>
          <Button
            fullWidth
            loading={create.isPending}
            disabled={!name || !fromDate || !toDate}
            onClick={() => create.mutate()}
          >
            Create Report
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
