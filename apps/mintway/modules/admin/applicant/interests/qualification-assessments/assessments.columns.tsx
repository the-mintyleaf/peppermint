"use client";

import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { StatusBadge } from "@peppermint/admin";

import {
  ELIGIBILITY_RESULT_COLORS,
  ELIGIBILITY_RESULT_LABELS,
  bsDateColumn,
} from "../../_shared";
import type { EligibilityResult, QualificationAssessment } from "../../_shared";

export const assessmentColumns: DataTableShellColumn<QualificationAssessment>[] =
  [
    bsDateColumn<QualificationAssessment>("assessment_date", "Date"),
    {
      accessor: "eligibility_result",
      title: "Eligibility",
      render: (a) =>
        a.eligibility_result ? (
          <StatusBadge<EligibilityResult>
            value={a.eligibility_result}
            colorMap={ELIGIBILITY_RESULT_COLORS}
            labelMap={ELIGIBILITY_RESULT_LABELS}
          />
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        ),
    },
    {
      accessor: "recommendation",
      title: "Recommendation",
      render: (a) => (
        <Text size="xs" lineClamp={2}>
          {a.recommendation || "—"}
        </Text>
      ),
    },
    {
      accessor: "is_current",
      title: "Current",
      render: (a) =>
        a.is_current ? (
          <Badge variant="light" color="teal">
            Current
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">
            Superseded
          </Text>
        ),
    },
  ];
