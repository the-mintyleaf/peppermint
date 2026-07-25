"use client";

import { booleanColumn, statusColumn } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";
import { Text } from "@peppermint/ui";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import {
  TEMPLATE_STATUS_COLORS,
  TEMPLATE_STATUS_LABELS,
  TEMPLATE_STATUS_OPTIONS,
} from "../../../checklists.labels";
import type {
  ChecklistTemplate,
  TemplateStatus,
} from "../../../checklists.types";
import { TemplateRowActionsMenu } from "./components/TemplateRowActionsMenu";

interface TemplatesColumnsOptions {
  onViewDetails: (template: ChecklistTemplate) => void;
}

export function getTemplatesColumns({
  onViewDetails,
}: TemplatesColumnsOptions): DataTableShellColumn<ChecklistTemplate>[] {
  return [
    {
      accessor: "label",
      title: "Template",
      icon: TagIcon,
      sortable: true,
    },
    {
      accessor: "country",
      title: "Country",
      icon: GlobeIcon,
      render: (row) => (
        <Text size="xs" c={row.country ? undefined : "dimmed"}>
          {row.country ? row.country.name : "General"}
        </Text>
      ),
    },
    booleanColumn<ChecklistTemplate>("is_default", {
      title: "Default",
      icon: StarIcon,
    }),
    statusColumn<ChecklistTemplate, TemplateStatus>("status", {
      title: "Status",
      icon: PulseIcon,
      colorMap: TEMPLATE_STATUS_COLORS,
      labelMap: TEMPLATE_STATUS_LABELS,
      filter: { type: "select", options: TEMPLATE_STATUS_OPTIONS },
    }),
    {
      accessor: "items",
      title: "Items",
      icon: ListChecksIcon,
      render: (row) => <Text size="xs">{row.items.length}</Text>,
    },
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (row) => (
        <TemplateRowActionsMenu template={row} onViewDetails={onViewDetails} />
      ),
    },
  ];
}
