"use client";

import Link from "next/link";
import { Button, SimpleGrid, Stack, Text } from "@peppermint/ui";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { useApplicantStatusCounts } from "../home.hooks";
import { StatTile } from "./StatTile";

/** Answers "how many applicants are in each standing?" */
export function ApplicantStatusPanel() {
  const { active, dormant, archived } = useApplicantStatusCounts();

  return (
    <Stack gap="sm">
      <Text size="sm" fw={600}>
        Applicants
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
        <StatTile
          label="Active"
          count={active.count}
          isLoading={active.isLoading}
          isError={active.isError}
          color="green"
          icon={
            <CheckCircleIcon
              size={20}
              color="var(--mantine-color-green-6)"
              aria-hidden
            />
          }
        />
        <StatTile
          label="Dormant"
          count={dormant.count}
          isLoading={dormant.isLoading}
          isError={dormant.isError}
          color="yellow"
          icon={
            <MoonIcon
              size={20}
              color="var(--mantine-color-yellow-6)"
              aria-hidden
            />
          }
        />
        <StatTile
          label="Archived"
          count={archived.count}
          isLoading={archived.isLoading}
          isError={archived.isError}
          color="gray"
          icon={
            <ArchiveIcon
              size={20}
              color="var(--mantine-color-gray-6)"
              aria-hidden
            />
          }
        />
      </SimpleGrid>
      <Button
        component={Link}
        href="/admin/applicants"
        variant="subtle"
        size="xs"
        rightSection={<ArrowRightIcon size={14} aria-hidden />}
      >
        View all applicants
      </Button>
    </Stack>
  );
}
