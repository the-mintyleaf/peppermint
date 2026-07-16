"use client";

import { Badge } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { BriefcaseIcon } from "@phosphor-icons/react/dist/csr/Briefcase";
import { CrownSimpleIcon } from "@phosphor-icons/react/dist/csr/CrownSimple";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { HashIcon } from "@phosphor-icons/react/dist/csr/Hash";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";

import { BilingualName } from "../../../_shared/components/BilingualName";
import type { Position, PositionStatus } from "../../positions.types";
import { PositionRowActionsMenu } from "./components/PositionRowActionsMenu";

const POSITION_STATUS_COLORS: Record<PositionStatus, string> = {
  draft: "gray",
  active: "green",
  inactive: "yellow",
  abolished: "red",
  archived: "dark",
};

export interface GetPositionsColumnsOptions {
  onViewDetails: (position: Position) => void;
}

export function getPositionsColumns({
  onViewDetails,
}: GetPositionsColumnsOptions): DataTableShellColumn<Position>[] {
  return [
    {
      accessor: "title_np",
      title: "Title",
      icon: BriefcaseIcon,
      sortable: true,
      render: (record) => (
        <BilingualName np={record.title_np} en={record.title_en} />
      ),
    },
    {
      accessor: "code",
      title: "Code",
      icon: HashIcon,
      sortable: true,
    },
    {
      accessor: "position_type",
      title: "Type",
      icon: CrownSimpleIcon,
    },
    {
      accessor: "status",
      title: "Status",
      icon: PulseIcon,
      render: (record) => (
        <Badge size="xs" color={POSITION_STATUS_COLORS[record.status]}>
          {record.status}
        </Badge>
      ),
    },
    {
      accessor: "max_occupants",
      title: "Capacity",
      icon: UsersThreeIcon,
    },
    {
      accessor: "id",
      key: "actions",
      title: "Actions",
      icon: DotsThreeVerticalIcon,
      sortable: false,
      render: (record) => (
        <PositionRowActionsMenu
          position={record}
          onViewDetails={onViewDetails}
        />
      ),
    },
  ];
}
