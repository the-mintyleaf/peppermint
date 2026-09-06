"use client";

import React from "react";
import { Box, Image, Paper, Stack, Table, Text, Title } from "@peppermint/ui";
import type { CvContent } from "@/modules/documents/documents.types";

type Data = CvContent & Record<string, unknown>;

const FONT = "'Times New Roman', serif";
const tp = {
  size: "14px",
  color: "black",
  style: { fontFamily: FONT },
} as const;

function Section({ children }: { children: React.ReactNode }) {
  return (
    <Text
      size="sm"
      fw={700}
      mt=".15in"
      mb=".06in"
      style={{
        textDecoration: "underline",
        color: "black",
        fontFamily: FONT,
        textTransform: "uppercase" as const,
      }}
    >
      {children}
    </Text>
  );
}

export interface TemplateStudentCVExtendedProps {
  data?: Record<string, unknown>;
}

export function TemplateStudentCVExtended({
  data,
}: TemplateStudentCVExtendedProps) {
  const d = (data ?? {}) as Data;
  const educations = d.educations ?? [];
  const experiences = d.experiences ?? [];
  const skills = (d.skills || "").split("\n").filter(Boolean);
  const courses = (d.courses_training || "").split("\n").filter(Boolean);

  const ref1 = d.ref1_name
    ? {
        name: d.ref1_name,
        title: d.ref1_title,
        institution: d.ref1_institution,
        address: d.ref1_address,
        email: d.ref1_email,
        contact: d.ref1_contact,
      }
    : null;
  const ref2 = d.ref2_name
    ? {
        name: d.ref2_name,
        title: d.ref2_title,
        institution: d.ref2_institution,
        address: d.ref2_address,
        email: d.ref2_email,
        contact: d.ref2_contact,
      }
    : null;

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
      {/* Header — the applicant's photograph sits at the top right, passport
          style, without pulling the centred name block off centre. */}
      <Box pos="relative">
        {d.image ? (
          <Image
            src={d.image}
            alt="Applicant photograph"
            w="28mm"
            h="36mm"
            fit="cover"
            pos="absolute"
            top={0}
            right={0}
            style={{ border: "1px solid #000" }}
          />
        ) : null}
        <Stack
          gap="2px"
          align="center"
          mb=".12in"
          px={d.image ? "30mm" : undefined}
        >
          <Title
            order={1}
            size="20px"
            fw={700}
            ta="center"
            style={{
              fontFamily: FONT,
              color: "black",
              textDecoration: "underline",
              letterSpacing: 0.5,
            }}
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
              Mobile no: {d.contact}
            </Text>
          )}
          {d.email && (
            <Text
              ta="center"
              size="14px"
              style={{
                fontFamily: FONT,
                color: "#1558d6",
                textDecoration: "underline",
              }}
            >
              E-mail: {d.email}
            </Text>
          )}
          {d.alternate_email && (
            <Text
              ta="center"
              size="14px"
              style={{
                fontFamily: FONT,
                color: "#1558d6",
                textDecoration: "underline",
              }}
            >
              Alternate Email: {d.alternate_email}
            </Text>
          )}
        </Stack>
      </Box>

      {/* Personal Information */}
      <Section>Personal Information:</Section>
      <Stack gap="1px">
        <Text {...tp}>Date of Birth: {d.date_of_birth}</Text>
        {d.passport_number && (
          <Text {...tp}>Passport Number: {d.passport_number}</Text>
        )}
        <Text {...tp}>
          Language Known: {d.languages_known || "Nepali, English"}
        </Text>
        <Text {...tp}>Nationality: {d.nationality || "Nepali"}</Text>
        <Text {...tp}>Gender: {d.gender}</Text>
        {d.religion && <Text {...tp}>Religion: {d.religion}</Text>}
      </Stack>

      {/* Academic Qualification */}
      {educations.length > 0 && (
        <>
          <Section>Academic Qualification:</Section>
          <Table
            withTableBorder
            withColumnBorders
            style={{ fontFamily: FONT, fontSize: "14px" }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ fontSize: "13px", fontFamily: FONT }}>
                  Level
                </Table.Th>
                <Table.Th style={{ fontSize: "13px", fontFamily: FONT }}>
                  School/College
                </Table.Th>
                <Table.Th style={{ fontSize: "13px", fontFamily: FONT }}>
                  GPA
                </Table.Th>
                <Table.Th style={{ fontSize: "13px", fontFamily: FONT }}>
                  Passed Year
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {educations.map((edu, i) => (
                <Table.Tr key={i}>
                  <Table.Td style={{ fontSize: "13px", fontFamily: FONT }}>
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

      {/* Gap Justification / Work Experience */}
      {experiences.length > 0 && (
        <>
          <Section>Gap Justification:</Section>
          <Stack gap="sm">
            {experiences.map((exp, i) => (
              <Box key={i} pl=".05in">
                <Text {...tp} fw={700}>
                  • {exp.company}
                </Text>
                <Text {...tp} fw={700} pl=".15in">
                  Duration: {exp.start_period}
                  {exp.end_period
                    ? ` to ${exp.end_period}`
                    : " till the present date"}
                </Text>
                {exp.description && (
                  <Text
                    size="14px"
                    pl=".15in"
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

      {/* Courses and Training */}
      {courses.length > 0 && (
        <>
          <Section>Courses and Training:</Section>
          <Stack gap="2px" pl=".05in">
            {courses.map((c, i) => (
              <Text key={i} {...tp}>
                • {c.replace(/^[•\-]\s*/, "")}
              </Text>
            ))}
          </Stack>
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <Section>Skills:</Section>
          <Stack gap="2px" pl=".05in">
            {skills.map((s, i) => (
              <Text key={i} {...tp}>
                • {s.replace(/^[•\-]\s*/, "")}
              </Text>
            ))}
          </Stack>
        </>
      )}

      {/* Reference */}
      {(ref1 || ref2) && (
        <>
          <Section>Reference</Section>
          <Stack gap="sm" pl=".05in">
            {[ref1, ref2].filter(Boolean).map((ref, i) => (
              <Box key={i}>
                <Text {...tp} fw={700}>
                  • {ref!.name}
                </Text>
                {ref!.title && (
                  <Text {...tp} pl=".15in">
                    {ref!.title}
                  </Text>
                )}
                {ref!.institution && (
                  <Text {...tp} pl=".15in">
                    {ref!.institution}
                  </Text>
                )}
                {ref!.address && (
                  <Text {...tp} pl=".15in">
                    {ref!.address}
                  </Text>
                )}
                {ref!.email && (
                  <Text
                    size="14px"
                    pl=".15in"
                    style={{
                      fontFamily: FONT,
                      color: "#1558d6",
                      textDecoration: "underline",
                    }}
                  >
                    Email: {ref!.email}
                  </Text>
                )}
                {ref!.contact && (
                  <Text {...tp} pl=".15in">
                    Contact Number: {ref!.contact}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        </>
      )}

      {/* Declaration */}
      <Section>Declaration:</Section>
      <Text
        size="14px"
        style={{ textAlign: "justify", fontFamily: FONT, color: "black" }}
      >
        I here declare that above given information is best of my knowledge and
        if found wrong then my candidature will be illegal.
      </Text>
    </Paper>
  );
}
