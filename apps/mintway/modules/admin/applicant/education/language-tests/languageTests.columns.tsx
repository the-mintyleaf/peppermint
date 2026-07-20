"use client";

import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";

import { LANGUAGE_TEST_TYPE_LABELS, bsDateColumn } from "../../_shared";
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
  bsDateColumn<LanguageTest>("test_date", "Test date"),
  bsDateColumn<LanguageTest>("expiry_date", "Expiry"),
];
