"use client";

import { Badge, Group, Stack, Text } from "@peppermint/ui";
import { languageTestTypeLabel } from "@/components/academic";
import {
  ProfileList,
  ProfileListRow,
  ProfilePanelHeader,
  ProfileSection,
} from "@/components/profile";
import type {
  ApplicantEducationPanelProps,
  CountBadgeProps,
  EducationRowProps,
  LanguageTestRowViewProps,
} from "./ApplicantEducationPanel.types";
import {
  educationScore,
  educationTitle,
  educationYears,
  formatTestDate,
  isTestExpired,
  joinFacts,
  languageTestScores,
} from "./ApplicantEducationPanel.utils";

/** Marks a record carried over from the converted lead — provenance, not state. */
function FromLeadBadge() {
  return (
    <Badge size="xs" variant="light" color="blue" radius="sm">
      From lead
    </Badge>
  );
}

function EducationRow({ education }: EducationRowProps) {
  const place = joinFacts([education.institution, education.country]);
  const result = joinFacts([
    educationScore(education),
    education.grading_system,
    educationYears(education),
  ]);
  return (
    <ProfileListRow>
      <Stack gap={2}>
        <Group gap="xs" wrap="wrap">
          <Text size="sm" fw={600}>
            {educationTitle(education)}
          </Text>
          {education.completion_status === "ongoing" ? (
            <Badge size="xs" variant="light" color="yellow">
              Ongoing
            </Badge>
          ) : null}
          {education.source_lead_id ? <FromLeadBadge /> : null}
        </Group>
        <Text size="xs" c="dimmed">
          {place || "No institution recorded"}
        </Text>
        {result ? <Text size="xs">{result}</Text> : null}
      </Stack>
    </ProfileListRow>
  );
}

function LanguageTestRowView({ test }: LanguageTestRowViewProps) {
  const scores = languageTestScores(test);
  const taken = formatTestDate(test.test_date);
  const expires = formatTestDate(test.expiry_date);
  const expired = isTestExpired(test);
  const dates = joinFacts([
    taken ? `Taken ${taken}` : null,
    expires ? `${expired ? "Expired" : "Expires"} ${expires}` : null,
    test.certificate_number ? `Certificate ${test.certificate_number}` : null,
  ]);
  return (
    <ProfileListRow>
      <Stack gap={2}>
        <Group gap="xs" wrap="wrap">
          <Text size="sm" fw={600}>
            {languageTestTypeLabel(test.test_type)}
          </Text>
          {expired ? (
            <Badge size="xs" variant="light" color="red">
              Expired
            </Badge>
          ) : null}
          {test.source_lead_id ? <FromLeadBadge /> : null}
        </Group>
        <Text size="xs">{scores ?? "No scores recorded"}</Text>
        {dates ? (
          <Text size="xs" c="dimmed">
            {dates}
          </Text>
        ) : null}
      </Stack>
    </ProfileListRow>
  );
}

function CountBadge({ count }: CountBadgeProps) {
  return count ? (
    <Badge size="xs" variant="light" circle>
      {count}
    </Badge>
  ) : null;
}

/**
 * The applicant's academic record: education (newest completion first, as
 * the server orders it — ongoing study leads) and language-test results.
 * Read-only here; both are edited as whole lists in the form's
 * "Education & tests" step. "From lead" marks records carried over at
 * conversion — the mark disappears once the list is re-saved (the backend
 * replaces the rows), which the form warns about.
 */
export function ApplicantEducationPanel({
  applicant,
}: ApplicantEducationPanelProps) {
  const { educations, language_tests: tests } = applicant;
  return (
    <Stack gap="lg">
      <ProfilePanelHeader
        title="Education & Tests"
        description="Qualifications and language-test results"
      />

      <ProfileSection
        title="Education"
        action={<CountBadge count={educations.length} />}
      >
        {educations.length === 0 ? (
          <Text size="xs" c="dimmed">
            No education on file.
          </Text>
        ) : (
          <ProfileList>
            {educations.map((education) => (
              <EducationRow key={education.id} education={education} />
            ))}
          </ProfileList>
        )}
      </ProfileSection>

      <ProfileSection
        title="Language tests"
        action={<CountBadge count={tests.length} />}
      >
        {tests.length === 0 ? (
          <Text size="xs" c="dimmed">
            No language tests on file.
          </Text>
        ) : (
          <ProfileList>
            {tests.map((test) => (
              <LanguageTestRowView key={test.id} test={test} />
            ))}
          </ProfileList>
        )}
      </ProfileSection>
    </Stack>
  );
}
