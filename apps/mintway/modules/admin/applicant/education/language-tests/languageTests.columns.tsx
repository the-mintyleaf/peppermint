"use client";

import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import { LANGUAGE_TEST_TYPE_LABELS } from "../../_shared";
import type { LanguageTest } from "../../_shared";

export const languageTestColumns: DataTableShellColumn<LanguageTest>[] = [
  {
    accessor: "test_type",
    title: "Test type",
    render: (t) => (
      <Badge variant="light" color="grape">
        {LANGUAGE_TEST_TYPE_LABELS[t.test_type] ?? t.test_type}
      </Badge>
    ),
  },
  {
    accessor: "overall_score",
    title: "Overall",
    render: (t) => (
      <Text size="xs" fw={500}>
        {t.overall_score || "—"}
      </Text>
    ),
  },
  {
    accessor: "test_date",
    title: "Test date",
    render: (t) => (
      <Text size="xs">{t.test_date ? t.test_date.slice(0, 10) : "—"}</Text>
    ),
  },
  {
    accessor: "expiry_date",
    title: "Expiry",
    render: (t) => (
      <Text size="xs">{t.expiry_date ? t.expiry_date.slice(0, 10) : "—"}</Text>
    ),
  },
];
