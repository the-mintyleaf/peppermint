"use client";

import { Badge, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";

import type { ReportingLine } from "../../reportingLines.types";
import { ReportingLineRowActionsMenu } from "./components/ReportingLineRowActionsMenu";

export interface GetReportingLinesColumnsOptions {
  onViewChain: (reportingLine: ReportingLine) => void;
}

export function getReportingLinesColumns({
  onViewChain,
}: GetReportingLinesColumnsOptions): DataTableShellColumn<ReportingLine>[] {
  return [
    {
      accessor: "source_position",
      title: "Source reports to Target",
      icon: ArrowRightIcon,
      render: (record) => (
        <Text size="xs">
          {record.source_position}{" "}
          <ArrowRightIcon size={10} style={{ verticalAlign: "middle" }} />{" "}
          {record.target_position}
        </Text>
      ),
    },
    {
      accessor: "reporting_line_type",
      title: "Type",
      icon: TagIcon,
    },
    {
      accessor: "is_primary",
      title: "Primary",
      icon: StarIcon,
      render: (record) => (record.is_primary ? "Yes" : "No"),
    },
    {
      accessor: "status",
      title: "Status",
      icon: TagIcon,
      render: (record) => <Badge size="xs">{record.status}</Badge>,
    },
    {
      accessor: "id",
      key: "actions",
      title: "Actions",
      icon: DotsThreeVerticalIcon,
      sortable: false,
      render: (record) => (
        <ReportingLineRowActionsMenu
          reportingLine={record}
          onViewChain={onViewChain}
        />
      ),
    },
  ];
}
