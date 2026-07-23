"use client";

import Link from "next/link";
import { Badge, Divider, Group, Stack, Text, dayjs } from "@peppermint/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { STAGE_COLORS, STAGE_LABELS } from "../../../../leadCategory.utils";
import type { LeadDetail } from "../../../../leadManagement.types";

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md" align="flex-start">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" ta="right" c={value ? undefined : "dimmed"}>
        {value || "—"}
      </Text>
    </Group>
  );
}

export function LeadOverviewPanel({ lead }: { lead: LeadDetail }) {
  return (
    <Stack gap="sm">
      <Group gap="xs">
        <Badge size="xs" variant="light" color={STAGE_COLORS[lead.stage]}>
          {STAGE_LABELS[lead.stage]}
        </Badge>
      </Group>

      <Divider label="Identity" labelPosition="left" />
      <Field label="Full name (Nepali)" value={lead.full_name_np} />
      <Field label="Full name (English)" value={lead.full_name_en} />
      <Field label="Email" value={lead.email} />
      <Field label="Address" value={lead.address} />

      <Divider label="Source" labelPosition="left" />
      <Field
        label="Lead source"
        value={lead.source.name_en || lead.source.name_np}
      />
      {lead.source_detail ? (
        <Field label="Details" value={lead.source_detail} />
      ) : null}

      <Divider label="Contact numbers" labelPosition="left" />
      {lead.contact_numbers.map((c) => (
        <Group key={c.id ?? c.number} justify="space-between" gap="xs">
          <Text size="xs">{c.number}</Text>
          <Group gap={4}>
            <Text size="xs" c="dimmed" tt="capitalize">
              {c.label}
            </Text>
            {c.is_primary ? (
              <Badge size="xs" variant="light" color="blue">
                Primary
              </Badge>
            ) : null}
          </Group>
        </Group>
      ))}

      <Divider label="Follow-up" labelPosition="left" />
      <Field
        label="Last followed up"
        value={
          lead.last_followed_up_at
            ? dayjs(lead.last_followed_up_at).format("MMM D, YYYY h:mm A")
            : null
        }
      />
      <Field
        label="Followed up by"
        value={
          lead.last_followed_up_by?.display_name ||
          lead.last_followed_up_by?.username ||
          null
        }
      />

      {lead.study_interest ? (
        <>
          <Divider label="Study interest" labelPosition="left" />
          <Field
            label="Countries"
            value={lead.study_interest.interested_countries.join(", ") || null}
          />
          <Field
            label="Study level"
            value={lead.study_interest.study_level || null}
          />
          <Field
            label="Field of study"
            value={lead.study_interest.field_of_study || null}
          />
          <Field
            label="Preferred intake"
            value={lead.study_interest.preferred_intake || null}
          />
          <Field
            label="Budget"
            value={
              lead.study_interest.budget_amount
                ? `${lead.study_interest.budget_amount} ${lead.study_interest.budget_currency}`
                : null
            }
          />
          <Field
            label="Scholarship interest"
            value={lead.study_interest.scholarship_interest ? "Yes" : "No"}
          />
          <Field
            label="Highest qualification"
            value={lead.study_interest.highest_qualification || null}
          />
          <Field
            label="Language test status"
            value={lead.study_interest.language_test_status || null}
          />
          {lead.study_interest.interest_notes ? (
            <Field label="Notes" value={lead.study_interest.interest_notes} />
          ) : null}
        </>
      ) : null}

      {lead.converted_applicant_id ? (
        <>
          {/* Keyed off the id, not `stage === "converted"` — reopening a
              converted lead moves its stage to an active one but never
              clears the conversion link, so the applicant/journey reference
              must stay visible even after reopen. */}
          <Divider label="Converted" labelPosition="left" />
          <Field
            label="Converted at"
            value={
              lead.converted_at
                ? dayjs(lead.converted_at).format("MMM D, YYYY h:mm A")
                : null
            }
          />
          <Field
            label="Converted by"
            value={
              lead.converted_by?.display_name ||
              lead.converted_by?.username ||
              null
            }
          />
          <Group justify="space-between" gap="xs">
            <Text size="xs" c="dimmed">
              Applicant
            </Text>
            <Text
              size="xs"
              c="blue"
              component={Link}
              href={`/admin/applicants/${lead.converted_applicant_id}`}
            >
              <Group gap={4} wrap="nowrap">
                View applicant
                <ArrowSquareOutIcon size={12} aria-hidden />
              </Group>
            </Text>
          </Group>
        </>
      ) : null}

      {lead.stage === "lost" ? (
        <>
          <Divider label="Why this lead is closed" labelPosition="left" />
          <Field
            label="Reason"
            value={
              lead.lost_reason?.name_en || lead.lost_reason?.name_np || null
            }
          />
          {lead.lost_detail ? (
            <Field label="Details" value={lead.lost_detail} />
          ) : null}
          <Field
            label="Closed at"
            value={
              lead.lost_at
                ? dayjs(lead.lost_at).format("MMM D, YYYY h:mm A")
                : null
            }
          />
          <Field
            label="Closed by"
            value={lead.lost_by?.display_name || lead.lost_by?.username || null}
          />
        </>
      ) : null}
    </Stack>
  );
}
