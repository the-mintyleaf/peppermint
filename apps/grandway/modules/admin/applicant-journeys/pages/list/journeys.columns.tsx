"use client";

import Link from "next/link";
import { Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { statusColumn } from "@peppermint/admin";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { FlagIcon } from "@phosphor-icons/react/dist/csr/Flag";
import {
  STAGE_COLORS,
  STAGE_LABELS,
  STUDY_LEVEL_LABELS,
} from "../../applicantJourneys.labels";
import type {
  ApplicantJourney,
  JourneyStage,
} from "../../applicantJourneys.types";
import { JourneyRowActionsMenu } from "./components/JourneyRowActionsMenu";

interface JourneysColumnsOptions {
  onViewDetails: (journey: ApplicantJourney) => void;
}

/**
 * Column-level `filter` on `stage`/`target_country` — the shell's own
 * filter-picker + active-filter chip bar (already wired to server-side
 * refetch) — is the mechanism for the "plain stage filter Select" / partial
 * target-country match confirmed via `/design-decisions`; `applicant` isn't
 * a column filter here since it arrives only as a deep-link (`?applicant=`,
 * see `JourneyWorklist.tsx`'s `forceFilters`), never picked from this table.
 */
export function getJourneysColumns({
  onViewDetails,
}: JourneysColumnsOptions): DataTableShellColumn<ApplicantJourney>[] {
  return [
    {
      accessor: "applicant.full_name_en",
      title: "Applicant",
      icon: UserIcon,
      render: (journey: ApplicantJourney) => (
        <Text
          size="xs"
          fw={500}
          component={Link}
          href={`/admin/applicants/${journey.applicant.id}`}
        >
          {journey.applicant.full_name_en || journey.applicant.full_name_np}
        </Text>
      ),
    },
    {
      accessor: "target_country",
      title: "Target country",
      icon: GlobeIcon,
      filter: { type: "text", placeholder: "e.g. Australia" },
      render: (journey: ApplicantJourney) => (
        <Text size="xs" c={journey.target_country ? undefined : "dimmed"}>
          {journey.target_country || "—"}
        </Text>
      ),
    },
    {
      accessor: "study_level",
      title: "Study level",
      icon: GraduationCapIcon,
      render: (journey: ApplicantJourney) => (
        <Text size="xs" c={journey.study_level ? undefined : "dimmed"}>
          {journey.study_level ? STUDY_LEVEL_LABELS[journey.study_level] : "—"}
        </Text>
      ),
    },
    {
      accessor: "preferred_intake",
      title: "Intake",
      icon: CalendarBlankIcon,
      render: (journey: ApplicantJourney) => (
        <Text size="xs" c={journey.preferred_intake ? undefined : "dimmed"}>
          {journey.preferred_intake || "—"}
        </Text>
      ),
    },
    statusColumn<ApplicantJourney, JourneyStage>("stage", {
      title: "Stage",
      icon: FlagIcon,
      colorMap: STAGE_COLORS,
      labelMap: STAGE_LABELS,
      filter: {
        type: "select",
        options: Object.entries(STAGE_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
    }),
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (journey: ApplicantJourney) => (
        <JourneyRowActionsMenu
          journey={journey}
          onViewDetails={onViewDetails}
        />
      ),
    },
  ];
}
