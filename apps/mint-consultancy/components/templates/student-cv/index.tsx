"use client";

import {
  Box,
  Flex,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Title,
  Divider,
  Progress,
  ThemeIcon,
} from "@zetsel/ui";
import { MapPin, Phone, Envelope, User, CalendarBlank } from "@phosphor-icons/react";
import { dayjs } from "@zetsel/ui";

export interface StudentCVData {
  id?: number;
  image?: string;
  student_code?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  current_address?: string;
  email?: string;
  contact?: string;
  contact_detail?: {
    emergency_contact_name?: string;
    emergency_contact_relation?: string;
    emergency_contact_phone?: string;
  };
  experiences?: {
    company: string;
    role: string;
    start_period: string;
    end_period: string;
  }[];
  educations?: {
    institution: string;
    degree: string;
    field_of_study: string;
    start_period: string;
    end_period: string;
  }[];
  family_members?: {
    name: string;
    relationship: string;
    age: number;
    occupation?: string;
    contact?: string;
  }[];
  gradings?: {
    grammar: string;
    conversation: string;
    composition: string;
    listening: string;
    reading: string;
  }[];
  batch_detail?: {
    course: string;
    name: string;
  };
}

export interface StudentCVProps {
  data?: StudentCVData;
}

const EMPTY_CV: StudentCVData = {
  full_name: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  current_address: "",
  email: "",
  contact: "",
  experiences: [],
  educations: [],
  family_members: [],
  gradings: [],
};

function gradeToPercent(grade: string) {
  const g = grade?.toUpperCase() || "C";
  if (g === "A") return 100;
  if (g === "B") return 75;
  if (g === "C") return 50;
  if (g === "D") return 25;
  return 0;
}

export function TemplateStudentCV({ data }: StudentCVProps) {
  const d = data ?? EMPTY_CV;

  const formatDate = (date: string | undefined) => {
    if (!date) return "——";
    return dayjs(date).format("YYYY-MM-DD");
  };

  const getPronoun = (gender: string | undefined) => {
    if (!gender) return "";
    return gender.toLowerCase() === "male" ? "Male" : gender.toLowerCase() === "female" ? "Female" : gender;
  };

  return (
    <Paper
      data-print-page
      radius={0}
      style={{
        position: "relative",
        width: "210mm",
        minHeight: "297mm",
        background: "white",
        color: "black",
        overflow: "hidden",
        display: "flex",
      }}
    >
      {/* LEFT SIDEBAR */}
      <Box
        style={{
          width: "35%",
          backgroundColor: "#5D5D5D", // Dark gray to match the image
          color: "white",
          padding: "24px 16px",
        }}
      >
        <Stack align="center" mt="md" mb="xl">
          {d.image ? (
            <Image
              src={d.image}
              alt="Profile"
              h={140}
              w={140}
              radius="50%"
              fit="cover"
              style={{ border: "2px solid rgba(255,255,255,0.2)" }}
            />
          ) : (
            <Box
              h={140}
              w={140}
              style={{
                borderRadius: "50%",
                backgroundColor: "#a0a0a0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <Text c="dimmed" size="xs">Photo</Text>
            </Box>
          )}
        </Stack>

        <Stack gap="xl">
          {/* Basic Info */}
          <Box>
            <Text size="lg" c="white" mb={4} style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 4 }}>
              Basic Information
            </Text>
            <Stack gap="xs" mt="sm">
              <Group gap="sm" wrap="nowrap">
                <CalendarBlank size={16} color="white" />
                <Text size="xs" c="white">{formatDate(d.date_of_birth)}</Text>
              </Group>
              <Group gap="sm" wrap="nowrap">
                <User size={16} color="white" />
                <Text size="xs" c="white">{getPronoun(d.gender)}</Text>
              </Group>
              <Group gap="sm" wrap="nowrap" align="flex-start">
                <MapPin size={16} color="white" style={{ marginTop: 2 }} />
                <Text size="xs" c="white" style={{ flex: 1 }}>{d.current_address || "——"}</Text>
              </Group>
            </Stack>
          </Box>

          {/* Contact Details */}
          <Box>
            <Text size="lg" c="white" mb={4} style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 4 }}>
              Contact Details
            </Text>
            <Stack gap="xs" mt="sm">
              <Group gap="sm" wrap="nowrap">
                <Phone size={16} color="white" />
                <Text size="xs" c="white">{d.contact || "——"}</Text>
              </Group>
              <Group gap="sm" wrap="nowrap">
                <Envelope size={16} color="white" />
                <Text size="xs" c="white" style={{ wordBreak: "break-all" }}>{d.email || "——"}</Text>
              </Group>
            </Stack>
          </Box>

          {/* Emergency Contact */}
          <Box>
            <Text size="lg" c="white" mb={4} style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 4 }}>
              Emergency Contact
            </Text>
            <Stack gap={2} mt="sm">
              <Text size="sm" fw={600} c="white">{d.contact_detail?.emergency_contact_name || "——"}</Text>
              <Text size="xs" c="gray.3">{d.contact_detail?.emergency_contact_relation || "Relation"}</Text>
              <Text size="xs" mt={4} c="white">T: {d.contact_detail?.emergency_contact_phone || "——"}</Text>
            </Stack>
          </Box>

          {/* Family Details */}
          {d.family_members && d.family_members.length > 0 && (
            <Box>
              <Text size="lg" c="white" mb={4} style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 4 }}>
                Family Overview
              </Text>
              <Stack gap="sm" mt="sm">
                {d.family_members.map((fam, idx) => (
                  <Box key={idx}>
                    <Text size="xs" fw={600} c="white">・{fam.name}</Text>
                    <Text size="xs" c="gray.3" pl={12}>
                      {fam.relationship} | Age: {fam.age} | {fam.occupation}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Batch Code */}
          {d.student_code && (
            <Box>
              <Text size="lg" c="white" mb={4} style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 4 }}>
                Batch Details
              </Text>
              <Stack gap="xs" mt="sm">
                <Text size="xs" c="white">Code: {d.student_code}</Text>
                <Text size="xs" c="white">Course: {d.batch_detail?.course}</Text>
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>

      {/* RIGHT MAIN CONTENT */}
      <Box
        style={{
          width: "65%",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack gap="xs" mb="xl">
          <Title order={1} size="32px" fw={800} style={{ textTransform: "uppercase", letterSpacing: 1.5, lineHeight: 1.1 }}>
            {d.first_name}
            <br />
            {d.last_name}
          </Title>
          <Text size="sm" c="dimmed">
            {d.full_name}
          </Text>
        </Stack>

        {/* Work Experience */}
        {d.experiences && d.experiences.length > 0 && (
          <Box mb="xl">
            <Text size="lg" fw={600} style={{ borderBottom: "1px solid #ddd", paddingBottom: 4 }} mb="md">
              Work Experience
            </Text>
            <Stack gap="md">
              {d.experiences.map((exp, idx) => (
                <Flex key={idx} gap="md">
                  <Box w="30%">
                    <Text size="xs" c="dimmed">{exp.start_period} - {exp.end_period || "Present"}</Text>
                  </Box>
                  <Box style={{ position: "relative" }} w="70%">
                    {/* Timeline specific styling */}
                    <Box
                      style={{
                        position: "absolute",
                        left: -14,
                        top: 6,
                        height: "10px",
                        width: "10px",
                        backgroundColor: "#5D5D5D",
                        borderRadius: "50%",
                      }}
                    />
                    <Box
                      style={{
                        position: "absolute",
                        left: -10,
                        top: 16,
                        bottom: -16,
                        borderLeft: "2px solid #eee",
                        display: idx === (d.experiences?.length || 0) - 1 ? "none" : "block",
                      }}
                    />
                    <Text size="sm" fw={600}>{exp.company}</Text>
                    <Text size="xs" c="dimmed">{exp.role}</Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </Box>
        )}

        {/* Education */}
        {d.educations && d.educations.length > 0 && (
          <Box mb="xl">
            <Text size="lg" fw={600} style={{ borderBottom: "1px solid #ddd", paddingBottom: 4 }} mb="md">
              Education
            </Text>
            <Stack gap="md">
              {d.educations.map((edu, idx) => (
                <Flex key={idx} gap="md">
                  <Box w="30%">
                    <Text size="xs" c="dimmed">{edu.start_period} - {edu.end_period || "Present"}</Text>
                  </Box>
                  <Box style={{ position: "relative" }} w="70%">
                    {/* Timeline dot */}
                    <Box
                      style={{
                        position: "absolute",
                        left: -14,
                        top: 6,
                        height: "10px",
                        width: "10px",
                        backgroundColor: "#5D5D5D",
                        borderRadius: "50%",
                      }}
                    />
                    <Box
                      style={{
                        position: "absolute",
                        left: -10,
                        top: 16,
                        bottom: -16,
                        borderLeft: "2px solid #eee",
                        display: idx === (d.educations?.length || 0) - 1 ? "none" : "block",
                      }}
                    />
                    <Text size="sm" fw={600}>{edu.institution}</Text>
                    <Text size="xs" c="dimmed">{edu.degree} - {edu.field_of_study}</Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </Box>
        )}

        {/* Skills / Grading */}
        {d.gradings && d.gradings.length > 0 && (
          <Box mb="xl">
            <Text size="lg" fw={600} style={{ borderBottom: "1px solid #ddd", paddingBottom: 4 }} mb="md">
              Skills
            </Text>
            <Flex wrap="wrap" gap="lg">
              <Box w="45%">
                <Text size="xs" mb={4}>Grammar - {d.gradings[0].grammar}</Text>
                <Progress value={gradeToPercent(d.gradings[0].grammar)} color="#5D5D5D" size="sm" />
              </Box>
              <Box w="45%">
                <Text size="xs" mb={4}>Conversation - {d.gradings[0].conversation}</Text>
                <Progress value={gradeToPercent(d.gradings[0].conversation)} color="#5D5D5D" size="sm" />
              </Box>
              <Box w="45%">
                <Text size="xs" mb={4}>Listening - {d.gradings[0].listening}</Text>
                <Progress value={gradeToPercent(d.gradings[0].listening)} color="#5D5D5D" size="sm" />
              </Box>
              <Box w="45%">
                <Text size="xs" mb={4}>Reading - {d.gradings[0].reading}</Text>
                <Progress value={gradeToPercent(d.gradings[0].reading)} color="#5D5D5D" size="sm" />
              </Box>
              <Box w="45%">
                <Text size="xs" mb={4}>Composition - {d.gradings[0].composition}</Text>
                <Progress value={gradeToPercent(d.gradings[0].composition)} color="#5D5D5D" size="sm" />
              </Box>
            </Flex>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
