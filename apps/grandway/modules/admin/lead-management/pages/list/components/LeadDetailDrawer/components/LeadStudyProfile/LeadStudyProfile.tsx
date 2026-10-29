"use client";

import { Paper, Stack, Text } from "@peppermint/ui";
import {
  languageTestTypeLabel,
  qualificationLevelLabel,
} from "@/components/academic";
import type { LanguageCertificate } from "../../../../../../leadManagement.types";
import {
  languageTestStatusLabel,
  studyLevelLabel,
} from "../../../../../../studyInterest.labels";
import { DetailField } from "../DetailField";
import { DetailSection } from "../DetailSection";
import type { LeadStudyProfileProps } from "./LeadStudyProfile.types";
import {
  formatAcademicScore,
  formatCertificateDate,
  formatOverallScore,
  formatPassYear,
  formatSectionScores,
} from "./LeadStudyProfile.utils";

/**
 * One certificate, framed: the test and its overall score are the line you
 * read; section scores, dates and number are the quiet detail beneath.
 */
function CertificateCard({
  certificate,
}: {
  certificate: LanguageCertificate;
}) {
  const overall = formatOverallScore(certificate);
  const sections = formatSectionScores(certificate);
  const taken = formatCertificateDate(
    certificate.test_date,
    certificate.test_date_bs,
  );
  const expires = formatCertificateDate(
    certificate.expiry_date,
    certificate.expiry_date_bs,
  );

  return (
    <Paper withBorder radius="md" p="xs">
      <Stack gap={2}>
        <Text size="xs" fw={600}>
          {languageTestTypeLabel(certificate.test_type)}
          {overall ? ` · Overall ${overall}` : ""}
        </Text>
        {sections ? (
          <Text size="xs" c="dimmed">
            {sections}
          </Text>
        ) : null}
        {taken || expires ? (
          <Text size="xs" c="dimmed">
            {[
              taken ? `Taken ${taken}` : null,
              expires ? `Expires ${expires}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        ) : null}
        {certificate.certificate_number ? (
          <Text size="xs" c="dimmed">
            No. {certificate.certificate_number}
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}

/**
 * The lead's study picture, read-only: what they want to study, what they
 * have already studied, and their English tests. Each section only renders
 * when it has something on file — a section never shows as an empty band —
 * except Language tests, which also renders for certificates alone (a lead
 * may hold results with no study interest recorded).
 */
export function LeadStudyProfile({ lead }: LeadStudyProfileProps) {
  const interest = lead.study_interest;
  const certificates = lead.language_certificates ?? [];
  const score = interest ? formatAcademicScore(interest) : null;
  const passYear = interest ? formatPassYear(interest) : null;
  const hasAcademic = Boolean(
    interest &&
    (interest.highest_qualification_level ||
      interest.highest_qualification ||
      score ||
      passYear),
  );
  const testStatus = interest
    ? languageTestStatusLabel(interest.language_test_status)
    : "";
  const hasLanguage = Boolean(testStatus) || certificates.length > 0;

  return (
    <>
      {interest ? (
        <DetailSection title="Study interest">
          <DetailField
            label="Countries"
            value={interest.interested_countries.join(", ") || null}
          />
          <DetailField
            label="Study level"
            value={studyLevelLabel(interest.study_level) || null}
          />
          <DetailField
            label="Field of study"
            value={interest.field_of_study || null}
          />
          <DetailField
            label="Preferred intake"
            value={interest.preferred_intake || null}
          />
          <DetailField
            label="Budget"
            value={
              interest.budget_amount
                ? `${interest.budget_amount} ${interest.budget_currency}`
                : null
            }
          />
          <DetailField
            label="Scholarship"
            value={interest.scholarship_interest ? "Yes" : "No"}
          />
          {interest.interest_notes ? (
            <DetailField
              label="Interest notes"
              value={interest.interest_notes}
              stacked
            />
          ) : null}
        </DetailSection>
      ) : null}

      {interest && hasAcademic ? (
        <DetailSection title="Academic background">
          <DetailField
            label="Highest qualification"
            value={
              qualificationLevelLabel(interest.highest_qualification_level) ||
              null
            }
          />
          <DetailField
            label="Programme"
            value={interest.highest_qualification || null}
          />
          <DetailField label="Grade" value={score} />
          <DetailField label="Pass year" value={passYear} />
        </DetailSection>
      ) : null}

      {hasLanguage ? (
        <DetailSection title="Language tests">
          <DetailField label="Test status" value={testStatus || null} />
          {certificates.length > 0 ? (
            <Stack gap={6}>
              {certificates.map((certificate) => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                />
              ))}
            </Stack>
          ) : (
            <DetailField label="Certificates" value={null} />
          )}
        </DetailSection>
      ) : null}
    </>
  );
}
