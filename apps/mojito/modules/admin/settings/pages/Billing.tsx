"use client";

import {
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  Button,
  Progress,
  Table,
  SimpleGrid,
  Skeleton,
  Anchor,
} from "@zetsel/ui";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { useBillingInfo } from "../settings.hooks";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/settings/billing";
const MODULE_INFO = { name: "billing", label: "Billing & Plan" };

export function Billing() {
  const { data, isLoading } = useBillingInfo();

  if (isLoading) {
    return (
      <ModulePageShell basePath={BASE_PATH} moduleInfo={MODULE_INFO} disableCreateButton>
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={120} radius="md" />)}
        </Stack>
      </ModulePageShell>
    );
  }

  if (!data) return null;

  const { currentPlan, nextBillingDate, paymentMethod, usage, invoices, availablePlans } = data;

  return (
    <ModulePageShell basePath={BASE_PATH} moduleInfo={MODULE_INFO} disableCreateButton>
      <Stack gap="md" style={{ overflow: "auto", height: "calc(100vh - 160px)" }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Paper withBorder radius="md" p="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={600} size="sm">Current Plan</Text>
                <Badge color="blue" variant="light" size="sm">{currentPlan.name}</Badge>
              </Group>
              <Text size="xl" fw={700}>
                ${currentPlan.price}
                <Text component="span" size="sm" c="dimmed" fw={400}>/{currentPlan.period}</Text>
              </Text>
              <Text size="xs" c="dimmed">Next billing: {nextBillingDate.toLocaleDateString()}</Text>
              <Text size="xs" c="dimmed">
                Payment: {paymentMethod.brand} ending in {paymentMethod.last4}
              </Text>
              <Button size="xs" variant="light" mt="xs">Upgrade Plan</Button>
            </Stack>
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Text fw={600} size="sm" mb="md">Usage</Text>
            <Stack gap="sm">
              {Object.entries(usage).map(([key, { used, limit }]) => (
                <Stack key={key} gap={4}>
                  <Group justify="space-between">
                    <Text size="xs" tt="capitalize">{key}</Text>
                    <Text size="xs" c="dimmed">{used} / {limit}</Text>
                  </Group>
                  <Progress
                    value={(used / limit) * 100}
                    color={used / limit > 0.9 ? "red" : used / limit > 0.7 ? "yellow" : "blue"}
                    size="sm"
                  />
                </Stack>
              ))}
            </Stack>
          </Paper>
        </SimpleGrid>

        <Paper withBorder radius="md" p="md">
          <Text fw={600} size="sm" mb="md">Available Plans</Text>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            {availablePlans.map((plan) => (
              <Paper
                key={plan.id}
                withBorder
                radius="md"
                p="md"
                style={{
                  borderColor: plan.id === currentPlan.id ? "var(--mantine-color-blue-4)" : undefined,
                }}
              >
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">{plan.name}</Text>
                    {plan.id === currentPlan.id && <Badge size="xs" color="blue">Current</Badge>}
                  </Group>
                  <Text fw={700}>
                    ${plan.price}
                    <Text component="span" size="xs" c="dimmed" fw={400}>/mo</Text>
                  </Text>
                  <Stack gap="xs">
                    {plan.features.map((f) => (
                      <Text key={f} size="xs" c="dimmed">· {f}</Text>
                    ))}
                  </Stack>
                  {plan.id !== currentPlan.id && (
                    <Button
                      size="xs"
                      variant={plan.price > currentPlan.price ? "filled" : "light"}
                      fullWidth
                    >
                      {plan.price > currentPlan.price ? "Upgrade" : "Downgrade"}
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Text fw={600} size="sm" mb="md">Invoices</Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invoices.map((inv) => (
                <Table.Tr key={inv.id}>
                  <Table.Td><Text size="sm">{inv.date.toLocaleDateString()}</Text></Table.Td>
                  <Table.Td><Text size="sm">${inv.amount}</Text></Table.Td>
                  <Table.Td><Badge size="xs" color="green" variant="light">{inv.status}</Badge></Table.Td>
                  <Table.Td>
                    {inv.pdfUrl && (
                      <Anchor href={inv.pdfUrl} size="xs" c="dimmed" aria-label="Download invoice">
                        <DownloadSimpleIcon size={14} />
                      </Anchor>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>
    </ModulePageShell>
  );
}
