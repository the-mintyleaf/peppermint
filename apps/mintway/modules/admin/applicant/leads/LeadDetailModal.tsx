"use client";

import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  ModalPaper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  dayjs,
} from "@peppermint/ui";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";

import {
  EDUCATION_LEVEL_LABELS,
  LEAD_SOURCE_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../_shared";
import type { Lead } from "./leads.types";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <Stack gap={0}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value || "—"}</Text>
    </Stack>
  );
}

function fmtDate(value?: string | null): string {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : "—";
}

/** Tri-state — blank is "never asked", which is not the same as "no". */
function visaLabel(value: boolean | null): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Not asked";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ModalPaper withBorder>
      <Stack gap="sm">
        <Title order={6}>{title}</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {children}
        </SimpleGrid>
      </Stack>
    </ModalPaper>
  );
}

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

/**
 * Read-only view of a converted enquiry.
 *
 * Conversion migrates a curated subset onto the applicant but deliberately leaves
 * the enquiry-only fields here — guardian details, education level, the visa
 * question, the JSON snapshots and the notes. Without this view that data would
 * be captured and then permanently unreachable, since a converted lead is frozen
 * and its edit action is withheld.
 */
export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const router = useRouter();
  if (!lead) return null;

  const eduCount = lead.education_qualification?.length ?? 0;
  const workCount = lead.work_experience?.length ?? 0;

  return (
    <Modal
      opened={lead !== null}
      onClose={onClose}
      title="Enquiry record"
      size="lg"
    >
      <Stack gap="md" p="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Group gap="xs">
              <Title order={4}>{lead.full_name || lead.first_name}</Title>
              <Badge size="sm" variant="light" color="teal">
                Converted
              </Badge>
            </Group>
            <Text size="xs" c="dimmed" ff="monospace">
              {lead.lead_code}
            </Text>
          </Stack>
          {lead.converted_applicant && (
            <Button
              size="xs"
              variant="light"
              onClick={() =>
                router.push(`/admin/applicants/${lead.converted_applicant}`)
              }
            >
              Open applicant
            </Button>
          )}
        </Group>

        <Alert
          variant="light"
          color="gray"
          icon={<LockKeyIcon size={16} aria-hidden />}
        >
          <Text size="xs">
            Frozen on {fmtDate(lead.converted_at)}
            {lead.converted_applicant_code
              ? ` when it became ${lead.converted_applicant_code}`
              : ""}
            . Enquiry records can&rsquo;t be edited after conversion.
          </Text>
        </Alert>

        <Section title="Contact">
          <Field label="Phone" value={lead.contact_number} />
          <Field label="Email" value={lead.email} />
          <Field label="Native name" value={lead.name_native} />
          <Field label="Date of birth" value={fmtDate(lead.date_of_birth)} />
          <Field label="Address" value={lead.address} />
          <Field label="Passport number" value={lead.passport_number} />
        </Section>

        <Section title="Enquiry detail">
          <Field
            label="Lead source"
            value={
              lead.lead_source
                ? LEAD_SOURCE_LABELS[lead.lead_source]
                : undefined
            }
          />
          <Field label="Source detail" value={lead.lead_source_detail} />
          <Field
            label="Education level"
            value={
              lead.education_level
                ? EDUCATION_LEVEL_LABELS[lead.education_level]
                : undefined
            }
          />
          <Field
            label="Payment preference"
            value={
              lead.payment_status
                ? PAYMENT_STATUS_LABELS[lead.payment_status]
                : undefined
            }
          />
          <Field
            label="Applied for a visa before"
            value={visaLabel(lead.has_applied_visa_before)}
          />
        </Section>

        <Section title="Guardian">
          <Field label="Name" value={lead.guardian_name} />
          <Field label="Contact" value={lead.guardian_contact} />
        </Section>

        {(eduCount > 0 || workCount > 0) && (
          <Section title="Captured history">
            {/*
              Counts only. These lists have no documented entry shape (gaps.md
              #10), so rendering named fields would mean inventing a contract.
            */}
            <Field
              label="Education entries"
              value={eduCount ? String(eduCount) : undefined}
            />
            <Field
              label="Work entries"
              value={workCount ? String(workCount) : undefined}
            />
          </Section>
        )}

        {lead.notes && (
          <ModalPaper withBorder>
            <Stack gap="sm">
              <Title order={6}>Notes</Title>
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {lead.notes}
              </Text>
            </Stack>
          </ModalPaper>
        )}
      </Stack>
    </Modal>
  );
}
