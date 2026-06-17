"use client";

import { useQuery } from "@peppermint/ui";
import { Stack, Group, Text, Badge, Paper, Divider, Timeline } from "@peppermint/ui";
import { ClockIcon }        from "@phosphor-icons/react/dist/csr/Clock";
import { CheckCircleIcon }  from "@phosphor-icons/react/dist/csr/CheckCircle";
import { WarningIcon }      from "@phosphor-icons/react/dist/csr/Warning";
import { fetchLoan } from "../../module.api";
import type { LoanStatus } from "../../module.api";

const statusColor: Record<LoanStatus, string> = {
  active:   "blue",
  overdue:  "red",
  returned: "green",
};

interface LoanViewProps {
  loanId: string;
}

export function LoanView({ loanId }: LoanViewProps) {
  const { data: loan, isPending } = useQuery({
    queryKey: ["loans", loanId],
    queryFn: () => fetchLoan(loanId),
  });

  if (isPending) return <Text p="xl" size="sm">Loading...</Text>;
  if (!loan)     return <Text p="xl" size="sm">Loan not found.</Text>;

  return (
    <Stack gap="xl" p="xl">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text fw={600} size="lg">{loan.bookTitle}</Text>
          <Text size="sm" c="dimmed">Loaned to {loan.memberName}</Text>
        </Stack>
        <Badge size="md" color={statusColor[loan.status as LoanStatus]}>{loan.status}</Badge>
      </Group>

      <Divider />

      <Group gap="xl">
        <Stack gap={2}>
          <Text size="xs" c="dimmed">Loan Date</Text>
          <Text size="sm">{loan.loanDate}</Text>
        </Stack>
        <Stack gap={2}>
          <Text size="xs" c="dimmed">Due Date</Text>
          <Text size="sm">{loan.dueDate}</Text>
        </Stack>
        {loan.returnDate && (
          <Stack gap={2}>
            <Text size="xs" c="dimmed">Return Date</Text>
            <Text size="sm">{loan.returnDate}</Text>
          </Stack>
        )}
      </Group>

      {loan.notes && (
        <Stack gap={4}>
          <Text size="xs" c="dimmed" fw={500}>Notes</Text>
          <Paper withBorder p="sm" radius="md">
            <Text size="sm">{loan.notes}</Text>
          </Paper>
        </Stack>
      )}

      <Divider label="Timeline" labelPosition="left" />

      <Timeline bulletSize={20} lineWidth={2}>
        {loan.timeline.map((event) => (
          <Timeline.Item
            key={event.id}
            bullet={<ClockIcon size={12} aria-label="Event" />}
            title={<Text size="xs" fw={500}>{event.event}</Text>}
          >
            <Text size="xs" c="dimmed">{new Date(event.timestamp).toLocaleString()}</Text>
            {event.note && <Text size="xs" mt={2}>{event.note}</Text>}
          </Timeline.Item>
        ))}
      </Timeline>
    </Stack>
  );
}
