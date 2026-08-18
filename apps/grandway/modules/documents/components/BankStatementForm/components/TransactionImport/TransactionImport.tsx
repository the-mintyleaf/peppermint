"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  FileButton,
  Group,
  List,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  notifications,
} from "@peppermint/ui";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import type {
  ParsedTransactionCsv,
  TransactionImportMode,
  TransactionImportProps,
} from "./TransactionImport.types";
import {
  downloadSampleCsv,
  parseTransactionCsv,
} from "./TransactionImport.utils";

/** Workbooks are not text — the browser cannot read one without a spreadsheet parser. */
const WORKBOOK = /\.(xlsx|xlsm|xls|ods|numbers)$/i;

const PREVIEW_ROWS = 8;
const PREVIEW_ISSUES = 6;

const money = (value?: number) =>
  value
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";

/**
 * Import transactions from a spreadsheet, and the sample file that teaches its shape.
 *
 * Nothing lands on the sheet straight off a file picker: the parse result is shown first —
 * how many rows were read, which lines were rejected and why, and the first few rows as
 * they will appear — then the operator chooses whether the file replaces the sheet or is
 * added below it. An import that silently overwrote a hand-typed statement would be
 * unrecoverable, since the form holds no undo.
 */
export function TransactionImport({
  onImport,
  existingRowCount,
  isLoading,
}: TransactionImportProps) {
  const [parsed, setParsed] = useState<ParsedTransactionCsv | null>(null);
  const [filename, setFilename] = useState("");
  const [resetKey, setResetKey] = useState(0);

  // FileButton keeps the chosen file until it is cleared, so picking the same file twice
  // in a row would not fire onChange again — remounting the input restores that.
  const clearPicker = () => setResetKey((key) => key + 1);

  const handleFile = async (file: File | null) => {
    clearPicker();
    if (!file) return;

    if (WORKBOOK.test(file.name)) {
      notifications.show({
        color: "yellow",
        title: "Save the workbook as CSV first",
        message:
          "Excel workbooks can't be read directly. In Excel choose File → Save As → CSV UTF-8, then import that file.",
      });
      return;
    }

    let text: string;
    try {
      text = await file.text();
    } catch {
      notifications.show({
        color: "red",
        title: "Couldn't read the file",
        message: "The file could not be opened. Try saving it again as CSV.",
      });
      return;
    }

    const result = parseTransactionCsv(text);

    if (result.rows.length === 0) {
      notifications.show({
        color: "red",
        title: "Nothing to import",
        message:
          result.issues.length > 0
            ? `No usable rows — ${result.issues[0].reason.toLowerCase()} (line ${result.issues[0].line}).`
            : "The file has no transaction rows. Download the sample to see the expected columns.",
      });
      return;
    }

    setFilename(file.name);
    setParsed(result);
  };

  const apply = (mode: TransactionImportMode) => {
    if (!parsed) return;
    onImport(parsed.rows, mode);
    notifications.show({
      color: "teal",
      title:
        mode === "replace" ? "Transactions replaced" : "Transactions added",
      message: `${parsed.rows.length} row${parsed.rows.length === 1 ? "" : "s"} imported from ${filename}${
        parsed.skipped > 0 ? ` · ${parsed.skipped} line(s) skipped` : ""
      }.`,
    });
    setParsed(null);
  };

  return (
    <>
      <FileButton
        key={resetKey}
        onChange={handleFile}
        accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
      >
        {(props) => (
          <Button
            {...props}
            size="xs"
            variant="light"
            color="indigo"
            leftSection={<UploadSimpleIcon size={14} />}
            disabled={isLoading}
          >
            Import CSV
          </Button>
        )}
      </FileButton>

      <Button
        size="xs"
        variant="subtle"
        leftSection={<DownloadSimpleIcon size={14} />}
        onClick={() => downloadSampleCsv()}
        disabled={isLoading}
      >
        Sample CSV
      </Button>

      <Modal
        opened={parsed !== null}
        onClose={() => setParsed(null)}
        title="Import transactions"
        size="lg"
      >
        {parsed ? (
          <Stack gap="md" p="md">
            <Group gap="xs">
              <Badge variant="light" color="teal">
                {parsed.rows.length} row{parsed.rows.length === 1 ? "" : "s"}{" "}
                ready
              </Badge>
              {parsed.skipped > 0 ? (
                <Badge variant="light" color="yellow">
                  {parsed.skipped} line{parsed.skipped === 1 ? "" : "s"} skipped
                </Badge>
              ) : null}
              <Text size="xs" c="dimmed">
                {filename}
              </Text>
            </Group>

            {parsed.ambiguousDates ? (
              <Alert
                variant="light"
                color="yellow"
                icon={<WarningIcon size={16} />}
                title="Check the dates"
              >
                <Text size="xs">
                  Dates written as 05/01/2026 were read as <b>day/month</b> — 5
                  January 2026. Save the file with YYYY-MM-DD dates if that is
                  the wrong way round.
                </Text>
              </Alert>
            ) : null}

            {parsed.warnings.length > 0 ? (
              <Alert
                variant="light"
                color="yellow"
                icon={<WarningIcon size={16} />}
                title="Check how the file was read"
              >
                <List size="xs" spacing={2}>
                  {parsed.warnings.map((warning) => (
                    <List.Item key={warning}>{warning}</List.Item>
                  ))}
                </List>
              </Alert>
            ) : null}

            {parsed.issues.length > 0 ? (
              <Alert
                variant="light"
                color="yellow"
                icon={<InfoIcon size={16} />}
                title="Lines that will not be imported"
              >
                <List size="xs" spacing={2}>
                  {parsed.issues.slice(0, PREVIEW_ISSUES).map((issue) => (
                    <List.Item key={issue.line}>
                      Line {issue.line} — {issue.reason}
                    </List.Item>
                  ))}
                </List>
                {parsed.issues.length > PREVIEW_ISSUES ? (
                  <Text size="xs" mt={4} c="dimmed">
                    …and {parsed.issues.length - PREVIEW_ISSUES} more.
                  </Text>
                ) : null}
              </Alert>
            ) : null}

            <ScrollArea.Autosize mah={260}>
              <Table
                striped
                withTableBorder
                fz="xs"
                verticalSpacing={4}
                stickyHeader
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={100}>Date</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th w={90} ta="right">
                      Debit
                    </Table.Th>
                    <Table.Th w={90} ta="right">
                      Credit
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {parsed.rows.slice(0, PREVIEW_ROWS).map((row, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{row.date}</Table.Td>
                      <Table.Td>
                        <Group gap={6} wrap="nowrap">
                          {row.type === "interest" ? (
                            <Badge size="xs" variant="light" color="teal">
                              Interest {row.interest_rate ?? ""}
                              {row.interest_rate === undefined ? "" : "%"}
                            </Badge>
                          ) : null}
                          {row.type === "tax" ? (
                            <Badge size="xs" variant="light" color="orange">
                              Tax {row.tax_rate ?? ""}
                              {row.tax_rate === undefined ? "" : "%"}
                            </Badge>
                          ) : null}
                          <Text size="xs">{row.description}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td ta="right">{money(row.debit)}</Table.Td>
                      <Table.Td ta="right">{money(row.credit)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea.Autosize>

            {parsed.rows.length > PREVIEW_ROWS ? (
              <Text size="xs" c="dimmed">
                Showing the first {PREVIEW_ROWS} of {parsed.rows.length} rows.
                Interest and tax amounts are calculated from the rows above once
                imported.
              </Text>
            ) : (
              <Text size="xs" c="dimmed">
                Interest and tax amounts are calculated from the rows above once
                imported — only their rates come from the file.
              </Text>
            )}

            <Group justify="space-between" gap="xs" align="center">
              <Text size="xs" c="dimmed">
                {existingRowCount > 0
                  ? `Replacing discards the ${existingRowCount} row${
                      existingRowCount === 1 ? "" : "s"
                    } on the sheet, opening balance included.`
                  : "The sheet is empty."}
              </Text>
              <Group gap="xs" wrap="nowrap">
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => setParsed(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => apply("append")}
                >
                  Add below existing rows
                </Button>
                <Button size="xs" color="red" onClick={() => apply("replace")}>
                  Replace all rows
                </Button>
              </Group>
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </>
  );
}
