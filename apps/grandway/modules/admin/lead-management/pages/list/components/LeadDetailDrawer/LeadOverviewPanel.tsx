"use client";

import Link from "next/link";
import {
  Anchor,
  Badge,
  Group,
  SimpleGrid,
  Stack,
  Text,
  dayjs,
} from "@peppermint/ui";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { SignpostIcon } from "@phosphor-icons/react/dist/csr/Signpost";
import { SwapIcon } from "@phosphor-icons/react/dist/csr/Swap";
import { PhoneCallIcon } from "@phosphor-icons/react/dist/csr/PhoneCall";
import type { LeadDetail } from "../../../../leadManagement.types";
import { DetailCard, DetailField } from "./components";

function formatDateTime(value: string | null): string | null {
  return value ? dayjs(value).format("MMM D, YYYY h:mm A") : null;
}

/**
 * The always-on body of the lead profile: every field, grouped into contained
 * cards by concept. The stage lives in the drawer header (as the interactive
 * switch), so it is deliberately absent here — this panel is facts, not levers.
 */
export function LeadOverviewPanel({ lead }: { lead: LeadDetail }) {
  const studyInterest = lead.study_interest;

  return (
    <Stack gap="md">
      <DetailCard
        title="Contact"
        icon={<AddressBookIcon size={14} aria-hidden />}
      >
        <DetailField label="Email" value={lead.email} />
        <DetailField label="Address" value={lead.address} />
        {lead.contact_numbers.length === 0 ? (
          <Text size="sm" c="dimmed">
            No contact numbers on file.
          </Text>
        ) : (
          lead.contact_numbers.map((c) => (
            <Group
              key={c.id ?? c.number}
              justify="space-between"
              wrap="nowrap"
              gap="md"
            >
              <Group gap={6} wrap="nowrap">
                <PhoneCallIcon size={13} aria-hidden />
                <Text size="sm" fw={500}>
                  {c.number}
                </Text>
              </Group>
              <Group gap={6} wrap="nowrap">
                <Text size="sm" c="dimmed" tt="capitalize">
                  {c.label}
                </Text>
                {c.is_primary ? (
                  <Badge size="xs" variant="light" color="blue">
                    Primary
                  </Badge>
                ) : null}
              </Group>
            </Group>
          ))
        )}
      </DetailCard>

      <DetailCard title="Source" icon={<SignpostIcon size={14} aria-hidden />}>
        <DetailField
          label="Lead source"
          value={lead.source.name || lead.source.name_en || lead.source.name_np}
        />
        {lead.source_detail ? (
          <DetailField label="Details" value={lead.source_detail} />
        ) : null}
      </DetailCard>

      <DetailCard
        title="Follow-up"
        icon={<PhoneCallIcon size={14} aria-hidden />}
      >
        <DetailField
          label="Last followed up"
          value={formatDateTime(lead.last_followed_up_at)}
        />
        <DetailField
          label="Followed up by"
          value={
            lead.last_followed_up_by?.display_name ||
            lead.last_followed_up_by?.username ||
            null
          }
        />
      </DetailCard>

      {studyInterest ? (
        <DetailCard
          title="Study interest"
          icon={<GraduationCapIcon size={14} aria-hidden />}
        >
          <SimpleGrid
            cols={{ base: 1, xs: 2 }}
            spacing="xs"
            verticalSpacing="xs"
          >
            <DetailField
              label="Countries"
              value={studyInterest.interested_countries.join(", ") || null}
            />
            <DetailField
              label="Study level"
              value={studyInterest.study_level || null}
            />
            <DetailField
              label="Field of study"
              value={studyInterest.field_of_study || null}
            />
            <DetailField
              label="Preferred intake"
              value={studyInterest.preferred_intake || null}
            />
            <DetailField
              label="Budget"
              value={
                studyInterest.budget_amount
                  ? `${studyInterest.budget_amount} ${studyInterest.budget_currency}`
                  : null
              }
            />
            <DetailField
              label="Scholarship"
              value={studyInterest.scholarship_interest ? "Yes" : "No"}
            />
            <DetailField
              label="Highest qualification"
              value={studyInterest.highest_qualification || null}
            />
            <DetailField
              label="Language test"
              value={studyInterest.language_test_status || null}
            />
          </SimpleGrid>
          {studyInterest.interest_notes ? (
            <DetailField label="Notes" value={studyInterest.interest_notes} />
          ) : null}
        </DetailCard>
      ) : null}

      {lead.converted_applicant_id ? (
        // Keyed off the id, not `stage === "converted"` — reopening a converted
        // lead moves its stage to an active one but never clears the conversion
        // link, so the applicant reference must stay visible even after reopen.
        <DetailCard
          title="Converted"
          icon={<SwapIcon size={14} aria-hidden />}
          action={
            <Anchor
              size="sm"
              component={Link}
              href={`/admin/applicants/${lead.converted_applicant_id}`}
            >
              <Group gap={4} wrap="nowrap">
                View applicant
                <ArrowSquareOutIcon size={13} aria-hidden />
              </Group>
            </Anchor>
          }
        >
          <DetailField
            label="Converted at"
            value={formatDateTime(lead.converted_at)}
          />
          <DetailField
            label="Converted by"
            value={
              lead.converted_by?.display_name ||
              lead.converted_by?.username ||
              null
            }
          />
        </DetailCard>
      ) : null}

      {lead.stage === "lost" ? (
        <DetailCard
          title="Why this lead is closed"
          icon={<ProhibitIcon size={14} aria-hidden />}
        >
          <DetailField
            label="Reason"
            value={
              lead.lost_reason?.name ||
              lead.lost_reason?.name_en ||
              lead.lost_reason?.name_np ||
              null
            }
          />
          {lead.lost_detail ? (
            <DetailField label="Details" value={lead.lost_detail} />
          ) : null}
          <DetailField label="Closed at" value={formatDateTime(lead.lost_at)} />
          <DetailField
            label="Closed by"
            value={lead.lost_by?.display_name || lead.lost_by?.username || null}
          />
        </DetailCard>
      ) : null}
    </Stack>
  );
}
