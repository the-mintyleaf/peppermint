"use client";

import type { ReactNode } from "react";
import {
  Badge,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
  dayjs,
} from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/csr/GlobeHemisphereWest";
import { CakeIcon } from "@phosphor-icons/react/dist/csr/Cake";
import { UserFocusIcon } from "@phosphor-icons/react/dist/csr/UserFocus";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";
import { PathIcon } from "@phosphor-icons/react/dist/csr/Path";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { LightningIcon } from "@phosphor-icons/react/dist/csr/Lightning";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { PaletteIcon } from "@phosphor-icons/react/dist/csr/Palette";

import {
  CASE_STATUS_COLORS,
  CASE_STATUS_LABELS,
  FOLLOW_UP_PRIORITY_COLORS,
  FOLLOW_UP_PRIORITY_LABELS,
  GENDER_LABELS,
  LEAD_SOURCE_LABELS,
} from "../../../_shared";
import type { CaseStatus, FollowUpPriority } from "../../../_shared";
import {
  useOverviewCases,
  useOverviewInterests,
} from "./ProfileOverview.hooks";
import styles from "./ProfileOverview.module.css";
import type { ProfileOverviewProps } from "./ProfileOverview.types";

const CHIP_COLORS = ["teal", "grape", "indigo", "orange", "cyan", "pink"];

function fmtDate(value?: string | null): string {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : "—";
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <Text component="span" size="sm" className={styles.label}>
        {icon}
        {label}
      </Text>
      <div className={styles.value}>{children}</div>
    </div>
  );
}

/** A plain right-aligned value, dimmed em-dash when absent. */
function Val({ children }: { children?: string | null }) {
  return children ? (
    <Text size="sm" fw={500}>
      {children}
    </Text>
  ) : (
    <Text size="sm" c="dimmed">
      —
    </Text>
  );
}

function InterestChips({
  applicantId,
  isAdmin,
}: {
  applicantId: string;
  isAdmin: boolean;
}) {
  const { data } = useOverviewInterests(applicantId, isAdmin);
  const tags = [
    ...(data?.preferred_fields ?? []),
    ...(data?.preferred_countries ?? []),
  ].slice(0, 6);
  if (tags.length === 0) return null;

  return (
    <DetailRow icon={<PaletteIcon size={16} aria-hidden />} label="Interests">
      <Group gap={6} justify="flex-end">
        {tags.map((tag, i) => (
          <Badge
            key={`${tag}-${i}`}
            variant="light"
            radius="sm"
            color={CHIP_COLORS[i % CHIP_COLORS.length]}
          >
            {tag}
          </Badge>
        ))}
      </Group>
    </DetailRow>
  );
}

function CasesBlock({ applicantId }: { applicantId: string }) {
  const { data, isLoading, isError } = useOverviewCases(applicantId);
  const cases = data?.data ?? [];
  const total = data?.meta.total ?? cases.length;

  return (
    <Stack gap="xs">
      <Group gap="xs" align="center">
        <Badge size="sm" variant="light" color="gray" radius="sm">
          {total}
        </Badge>
        <Title order={6}>Cases</Title>
      </Group>

      {isLoading ? (
        <Skeleton height={40} radius="sm" />
      ) : isError ? (
        <Text size="sm" c="dimmed">
          Couldn&apos;t load cases.
        </Text>
      ) : cases.length === 0 ? (
        <Text size="sm" c="dimmed">
          No cases opened yet.
        </Text>
      ) : (
        <Stack gap={4}>
          {cases.slice(0, 5).map((c) => (
            <Group key={c.id} justify="space-between" wrap="nowrap" gap="sm">
              <Text size="sm" fw={500} truncate>
                {c.case_code}
                {c.program ? ` · ${c.program}` : ""}
              </Text>
              <StatusBadge<CaseStatus>
                value={c.case_status}
                colorMap={CASE_STATUS_COLORS}
                labelMap={CASE_STATUS_LABELS}
              />
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

/**
 * Overview tab — a read profile of the applicant's core fields (the reference's details
 * list), a chips row for their interests, and a short summary of their cases. Admin-only
 * fields render only for admin; the staff projection omits them from the API.
 */
export function ProfileOverview({ applicant, isAdmin }: ProfileOverviewProps) {
  return (
    <Stack gap="lg">
      <Stack gap={0}>
        <DetailRow
          icon={<GlobeHemisphereWestIcon size={16} aria-hidden />}
          label="Nationality"
        >
          <Val>{applicant.nationality}</Val>
        </DetailRow>

        {isAdmin && (
          <>
            <DetailRow
              icon={<CakeIcon size={16} aria-hidden />}
              label="Date of birth"
            >
              <Val>{fmtDate(applicant.date_of_birth)}</Val>
            </DetailRow>
            <DetailRow
              icon={<UserFocusIcon size={16} aria-hidden />}
              label="Gender"
            >
              <Val>
                {applicant.gender ? GENDER_LABELS[applicant.gender] : null}
              </Val>
            </DetailRow>
          </>
        )}

        <DetailRow
          icon={<EnvelopeSimpleIcon size={16} aria-hidden />}
          label="Primary email"
        >
          <Val>{applicant.primary_email}</Val>
        </DetailRow>
        <DetailRow
          icon={<PhoneIcon size={16} aria-hidden />}
          label="Primary phone"
        >
          <Val>{applicant.primary_phone}</Val>
        </DetailRow>
        <DetailRow
          icon={<PathIcon size={16} aria-hidden />}
          label="Lead source"
        >
          <Val>
            {applicant.lead_source
              ? LEAD_SOURCE_LABELS[applicant.lead_source]
              : null}
          </Val>
        </DetailRow>

        {isAdmin && (
          <>
            <DetailRow
              icon={<CalendarBlankIcon size={16} aria-hidden />}
              label="Next follow-up"
            >
              <Group gap="xs" justify="flex-end" wrap="nowrap">
                <Val>{fmtDate(applicant.next_follow_up_at)}</Val>
                {applicant.follow_up_priority && (
                  <StatusBadge<FollowUpPriority>
                    value={applicant.follow_up_priority}
                    colorMap={FOLLOW_UP_PRIORITY_COLORS}
                    labelMap={FOLLOW_UP_PRIORITY_LABELS}
                  />
                )}
              </Group>
            </DetailRow>
            <DetailRow
              icon={<LightningIcon size={16} aria-hidden />}
              label="Last contacted"
            >
              <Val>{fmtDate(applicant.last_contacted_at)}</Val>
            </DetailRow>
          </>
        )}

        <DetailRow
          icon={<SparkleIcon size={16} aria-hidden />}
          label="Last updated"
        >
          <Val>{fmtDate(applicant.updated_at)}</Val>
        </DetailRow>

        <InterestChips applicantId={applicant.id} isAdmin={isAdmin} />
      </Stack>

      <CasesBlock applicantId={applicant.id} />
    </Stack>
  );
}
