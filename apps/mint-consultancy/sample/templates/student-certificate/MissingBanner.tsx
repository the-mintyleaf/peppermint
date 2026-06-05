"use client";
import { ActionIcon, Button, Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { ExclamationMarkIcon, PencilIcon, PenIcon } from "@phosphor-icons/react";
import { useDocContext, StudentCertificateData } from "@/context/DocumentContext";

interface RequiredField {
  label: string;
  check: (d: StudentCertificateData | null) => boolean;
}

const REQUIRED_FIELDS: RequiredField[] = [
  { label: "First Name", check: (d) => !!d?.firstname },
  { label: "Last Name", check: (d) => !!d?.lastname },
  { label: "Date of Birth", check: (d) => !!d?.date_of_birth },
  { label: "Gender", check: (d) => !!d?.gender },
  { label: "Address", check: (d) => !!d?.address },
  { label: "Date of Admission", check: (d) => !!d?.date_of_admission },
  { label: "Issue Date", check: (d) => !!d?.issue },
  { label: "Course Hours", check: (d) => !!d?.coursehour },
  { label: "Course Name", check: (d) => !!d?.batch?.course?.name },
  { label: "Course Level", check: (d) => !!d?.batch?.course?.level },
];

export function StudentCertMissingBanner() {
  const { documentData } = useDocContext();
  const missing = REQUIRED_FIELDS.filter((f) => !f.check(documentData));

  if (missing.length === 0) return null;

  return (
    <Paper p="md" my="xs" bg="orange.0" w="8.3in">
      <Group wrap="nowrap">
        <ThemeIcon variant="light" color="orange">
          <ExclamationMarkIcon />
        </ThemeIcon>


        <Text size="xs" mb={4}>
          <b>The following fields are missing:</b>{" "}
          {missing.map((f) => f.label).join(", ")}
        </Text>

        <ActionIcon variant="light" color="orange" >
          <PenIcon weight="fill" />
        </ActionIcon>


      </Group>
    </Paper>
  );
}
