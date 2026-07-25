"use client";

import { Text } from "@peppermint/ui";
import { booleanColumn, statusColumn } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";
import { BooksIcon } from "@phosphor-icons/react/dist/csr/Books";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { CoinsIcon } from "@phosphor-icons/react/dist/csr/Coins";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { TimerIcon } from "@phosphor-icons/react/dist/csr/Timer";
import {
  AVAILABILITY_COLORS,
  AVAILABILITY_LABELS,
  AVAILABILITY_OPTIONS,
  formatTuition,
  QUALIFICATION_LEVEL_LABELS,
  QUALIFICATION_LEVEL_OPTIONS,
} from "../../../institutions.constants";
import type {
  AvailabilityStatus,
  Country,
  Field,
  Institution,
  Program,
} from "../../../institutions.types";
import { ProgramRowActions } from "./components/ProgramRowActions";

interface ProgramsColumnsOptions {
  countries: Country[];
  institutions: Institution[];
  fields: Field[];
  canManage: boolean;
  onView: (program: Program) => void;
}

const SCHOLARSHIP_FILTER_OPTIONS = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

export function getProgramsColumns({
  countries,
  institutions,
  fields,
  canManage,
  onView,
}: ProgramsColumnsOptions): DataTableShellColumn<Program>[] {
  return [
    {
      accessor: "title",
      title: "Title",
      icon: GraduationCapIcon,
      key: "title",
      render: (row) => (
        <Text size="xs" fw={500}>
          {row.title}
        </Text>
      ),
    },
    {
      accessor: "institution",
      title: "Institution",
      icon: BuildingsIcon,
      key: "institution",
      filter: {
        type: "select",
        options: institutions.map((i) => ({ label: i.name, value: i.id })),
      },
      render: (row) => <Text size="xs">{row.institution.name}</Text>,
    },
    {
      accessor: "campus",
      title: "Campus",
      icon: MapPinIcon,
      key: "campus",
      render: (row) => (
        <Text size="xs" c={row.campus ? undefined : "dimmed"}>
          {row.campus ? row.campus.city || row.campus.name : "—"}
        </Text>
      ),
    },
    {
      accessor: "country",
      title: "Country",
      icon: GlobeIcon,
      key: "country",
      filter: {
        type: "select",
        options: countries.map((c) => ({ label: c.name, value: c.id })),
      },
      render: (row) => <Text size="xs">{row.country.name}</Text>,
    },
    {
      accessor: "qualification_level",
      title: "Level",
      icon: StackIcon,
      key: "qualification_level",
      filter: { type: "select", options: QUALIFICATION_LEVEL_OPTIONS },
      render: (row) => (
        <Text size="xs">
          {QUALIFICATION_LEVEL_LABELS[row.qualification_level]}
        </Text>
      ),
    },
    {
      accessor: "field",
      title: "Field",
      icon: BooksIcon,
      key: "field",
      filter: {
        type: "select",
        options: fields.map((f) => ({ label: f.name, value: f.id })),
      },
      render: (row) => <Text size="xs">{row.field.name}</Text>,
    },
    {
      accessor: "duration_months",
      title: "Duration",
      icon: TimerIcon,
      key: "duration_months",
      render: (row) => (
        <Text size="xs" c={row.duration_months ? undefined : "dimmed"}>
          {row.duration_months ? `${row.duration_months} mo` : "—"}
        </Text>
      ),
    },
    {
      accessor: "tuition_amount",
      title: "Tuition",
      icon: CoinsIcon,
      key: "tuition_amount",
      filter: { type: "number", placeholder: "Max tuition" },
      render: (row) => (
        <Text size="xs" c={row.tuition_amount ? undefined : "dimmed"}>
          {formatTuition(
            row.tuition_amount,
            row.tuition_currency,
            row.tuition_fee_period,
          )}
        </Text>
      ),
    },
    booleanColumn<Program>("scholarship_available", {
      title: "Scholarship",
      key: "scholarship_available",
      filter: { type: "select", options: SCHOLARSHIP_FILTER_OPTIONS },
    }),
    statusColumn<Program, AvailabilityStatus>("availability_status", {
      title: "Availability",
      icon: PulseIcon,
      key: "availability_status",
      colorMap: AVAILABILITY_COLORS,
      labelMap: AVAILABILITY_LABELS,
      filter: { type: "select", options: AVAILABILITY_OPTIONS },
    }),
    {
      accessor: "actions",
      title: "",
      key: "actions",
      textAlign: "right",
      render: (row) => (
        <ProgramRowActions
          program={row}
          canManage={canManage}
          onView={onView}
        />
      ),
    },
  ];
}
