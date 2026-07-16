"use client";

import React from "react";
import { Box, Paper, Stack, Table, Text, Title } from "@peppermint/ui";
import type { CvContent } from "@/modules/documents/documents.types";

type Data = CvContent & Record<string, unknown>;

const FONT = "'Times New Roman', serif";
const tp = {
  size: "14px",
  color: "black",
  style: { fontFamily: FONT },
} as const;
const LINK_BLUE = "#1558d6";

function fmtDate(s: string | undefined) {
  if (!s) return "——";
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <Text
      size="sm"
      fw={600}
      mt=".15in"
      mb=".05in"
      style={{
        textDecoration: "underline",
        color: LINK_BLUE,
        fontFamily: FONT,
      }}
    >
      {children}
    </Text>
  );
}

export interface TemplateStudentCVStandardProps {
  data?: Record<string, unknown>;
}

export function TemplateStudentCVStandard({
  data,
}: TemplateStudentCVStandardProps) {
  const d = (data ?? {}) as Data;
  const skills = (d.skills || "").split("\n").filter(Boolean);
  const educations = d.educations ?? [];
  const experiences = d.experiences ?? [];

  return (
    <Paper
      data-print-page
      radius={0}
      p=".6in"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "white",
        color: "black",
        fontFamily: FONT,
      }}
    >
      {/* Header */}
      <Stack gap="2px" align="center" mb=".12in">
        <Title
          order={1}
          size="20px"
          fw={700}
          ta="center"
          style={{ fontFamily: FONT, color: "black", letterSpacing: 0.5 }}
        >
          {String(d.full_name || "").toUpperCase()}
        </Title>
        {d.current_address && (
          <Text {...tp} ta="center">
            Address: {d.current_address}
          </Text>
        )}
        {d.contact && (
          <Text {...tp} ta="center">
            Contact Number: {d.contact}
          </Text>
        )}
        {d.email && (
          <Text
            ta="center"
            size="14px"
            style={{
              fontFamily: FONT,
              color: LINK_BLUE,
              textDecoration: "underline",
            }}
          >
            Email: {d.email}
          </Text>
        )}
      </Stack>

      {/* Personal Information */}
      <Section>PERSONAL INFORMATION</Section>
      <Stack gap="1px">
        <Text {...tp}>Date of birth: {fmtDate(d.date_of_birth)}</Text>
        <Text {...tp}>Nationality: {d.nationality || "Nepali"}</Text>
        <Text {...tp}>Gender: {d.gender}</Text>
        <Text {...tp}>
          Language Known: {d.languages_known || "Nepali, English"}
        </Text>
      </Stack>

      {/* Passport Details */}
      {d.passport_number && (
        <>
          <Section>PASSPORT DETAILS</Section>
          <Stack gap="1px">
            <Text {...tp}>Passport Number: {d.passport_number}</Text>
            <Text {...tp}>Date of issue: {fmtDate(d.passport_issue_date)}</Text>
            <Text {...tp}>
              Date of expiry: {fmtDate(d.passport_expiry_date)}
            </Text>
          </Stack>
        </>
      )}

      {/* Educational Credentials */}
      {educations.length > 0 && (
        <>
          <Section>EDUCATIONAL CREDENTIALS</Section>
          <Table
            withTableBorder
            withColumnBorders
            style={{ fontFamily: FONT, fontSize: "14px" }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ fontSize: "13px", fontFamily: FONT }}>
                  Level of examination
                </Table.Th>
                <Table.Th style={{ fontSize: "13px", fontFamily: FONT }}>
                  Name of institution
                </Table.Th>
                <Table.Th style={{ fontSize: "13px", fontFamily: FONT }}>
                  GPA/%
                </Table.Th>
                <Table.Th style={{ fontSize: "13px", fontFamily: FONT }}>
                  Pass out year
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {educations.map((edu, i) => (
                <Table.Tr key={i}>
                  <Table.Td
                    style={{
                      fontSize: "13px",
                      fontFamily: FONT,
                      textAlign: "center",
                    }}
                  >
                    {edu.degree}
                  </Table.Td>
                  <Table.Td style={{ fontSize: "13px", fontFamily: FONT }}>
                    {edu.institution}
                  </Table.Td>
                  <Table.Td
                    style={{
                      fontSize: "13px",
                      fontFamily: FONT,
                      textAlign: "center",
                    }}
                  >
                    {edu.gpa || edu.field_of_study}
                  </Table.Td>
                  <Table.Td
                    style={{
                      fontSize: "13px",
                      fontFamily: FONT,
                      textAlign: "center",
                    }}
                  >
                    {edu.end_period}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </>
      )}

      {/* Achievement — IELTS */}
      {d.ielts_overall && (
        <>
          <Section>ACHIEVEMENT</Section>
          <Box>
            <Text {...tp} fw={600} mb="2px">
              • IELTS Score
            </Text>
            <Text
              size="14px"
              pl=".15in"
              style={{ textAlign: "justify", fontFamily: FONT, color: "black" }}
            >
              I completed my IELTS examination on {fmtDate(d.ielts_date)} where
              I managed to score an overall of {d.ielts_overall} (Listening:{" "}
              {d.ielts_listening} Reading: {d.ielts_reading} Writing:{" "}
              {d.ielts_writing} and Speaking: {d.ielts_speaking})
            </Text>
          </Box>
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <Section>SKILL</Section>
          <Stack gap="2px">
            {skills.map((s, i) => (
              <Text key={i} {...tp}>
                • {s.replace(/^[•\-]\s*/, "")}
              </Text>
            ))}
          </Stack>
        </>
      )}

      {/* Work Experience */}
      {experiences.length > 0 && (
        <>
          <Section>WORK EXPERIENCE</Section>
          <Stack gap="sm">
            {experiences.map((exp, i) => (
              <Box key={i}>
                <Text {...tp} fw={700}>
                  {exp.company}
                </Text>
                <Text {...tp}>
                  {exp.start_period}
                  {exp.end_period ? `- ${exp.end_period}` : "- Till Present"}
                </Text>
                {exp.description && (
                  <Text
                    size="14px"
                    style={{
                      textAlign: "justify",
                      fontFamily: FONT,
                      color: "black",
                    }}
                  >
                    {exp.description}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        </>
      )}

      {/* Declaration */}
      <Section>DECLARATION</Section>
      <Text
        size="14px"
        style={{ textAlign: "justify", fontFamily: FONT, color: "black" }}
      >
        I attest that all the information presented in this document is accurate
        and complete to the best of my understanding and belief.
      </Text>
    </Paper>
  );
}
