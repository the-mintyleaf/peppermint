"use client";

import { Paper, Stack, Text, Title, Table, Divider } from "@zetsel/ui";
import type { DocumentTemplateProps, BankStatementContent } from "../../documents.types";

const BANK_LABELS: Record<string, string> = {
  mizuho: "Mizuho Bank",
  smbc: "SMBC",
  mufg: "MUFG Bank",
};

export function BankStatementTemplate({
  document,
  historicalSnapshot,
  isHistorical,
}: DocumentTemplateProps) {
  const content = (historicalSnapshot?.content ?? document.content) as BankStatementContent;
  const bankName = BANK_LABELS[content.bankKey] ?? content.bankKey;

  return (
    <Paper
      shadow="sm"
      p="xl"
      maw={700}
      w="100%"
      style={{ background: "#fff", color: "#1a1a1a" }}
    >
      <Stack gap="md">
        {isHistorical && (
          <Text size="xs" c="dimmed">
            Historical snapshot
          </Text>
        )}
        <Title order={3}>{bankName}</Title>
        <Text size="sm">Account Statement</Text>
        <Divider />
        <Stack gap={4}>
          <Text size="sm">
            <strong>Account Holder:</strong> {content.accountHolder}
          </Text>
          <Text size="sm">
            <strong>Account Number:</strong> {content.accountNumber}
          </Text>
          <Text size="sm">
            <strong>Period:</strong> {content.periodStart} — {content.periodEnd}
          </Text>
        </Stack>
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Opening Balance</Table.Th>
              <Table.Th>Closing Balance</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>¥{content.openingBalance.toLocaleString()}</Table.Td>
              <Table.Td>¥{content.closingBalance.toLocaleString()}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        {content.transactions.length > 0 && (
          <Table withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Amount</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {content.transactions.map((tx, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{tx.date}</Table.Td>
                  <Table.Td>{tx.description}</Table.Td>
                  <Table.Td>¥{tx.amount.toLocaleString()}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>
    </Paper>
  );
}
