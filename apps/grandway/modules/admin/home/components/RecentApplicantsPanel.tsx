"use client";

import Link from "next/link";
import { Badge, Button, Group, Loader, Stack, Text } from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useRecentApplicants } from "../home.hooks";

const STATUS_COLORS: Record<string, string> = {
  active: "green",
  dormant: "yellow",
  archived: "gray",
};

/** Answers "who was added recently?" */
export function RecentApplicantsPanel() {
  const { applicants, isLoading, isError, isRefetching, refetch } =
    useRecentApplicants();

  return (
    <Stack gap="sm">
      <Text size="sm" fw={600}>
        Recently added applicants
      </Text>

      {isLoading ? (
        <Loader size="sm" />
      ) : isError ? (
        <QueryErrorState
          message="Couldn't load recent applicants."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : applicants.length === 0 ? (
        <Text size="xs" c="dimmed">
          No applicants yet.
        </Text>
      ) : (
        <Stack gap="xs">
          {applicants.map((applicant) => (
            <Group
              key={applicant.id}
              justify="space-between"
              gap="xs"
              wrap="nowrap"
            >
              <Text
                size="sm"
                component={Link}
                href={`/admin/applicants/${applicant.id}`}
                truncate
                style={{ minWidth: 0 }}
              >
                {applicant.full_name_en || applicant.full_name_np}
              </Text>
              <Badge
                size="xs"
                variant="light"
                color={STATUS_COLORS[applicant.status]}
              >
                {applicant.status}
              </Badge>
            </Group>
          ))}
        </Stack>
      )}

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
