"use client";

import { useParams } from "next/navigation";
import {
  Center,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
} from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";

import { ProfileCard } from "./components/ProfileCard";
import { SetupProgressCard } from "./components/SetupProgressCard";
import { StatusActionCard } from "./components/StatusActionCard";
import {
  useOrganizationDetail,
  useSetupProgress,
} from "./OrganizationOverview.hooks";

function OrganizationOverviewContent() {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const {
    data: organization,
    isLoading,
    isError,
  } = useOrganizationDetail(orgId);
  const progress = useSetupProgress(orgId);

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Organization", href: "/admin/organization" },
          { label: organization?.name_np ?? "Overview", href: "#" },
        ]}
      />
      <ModalPaper withBorder>
        {isLoading ? (
          <Center h="100%" mih={400}>
            <Loader size="sm" />
          </Center>
        ) : isError || !organization ? (
          <Center h="100%" mih={400}>
            <Text c="dimmed" size="sm">
              That organization couldn&apos;t be found. Return to the
              organization list and try again.
            </Text>
          </Center>
        ) : (
          <Stack gap="md" p="md">
            <ProfileCard organization={organization} />
            <StatusActionCard
              organization={organization}
              hasRootUnit={progress.hasRootUnit}
            />
            <SetupProgressCard
              organizationId={orgId}
              hasRootUnit={progress.hasRootUnit}
              membersInvited={progress.membersInvited}
              isLoading={progress.isLoading}
            />
          </Stack>
        )}
      </ModalPaper>
    </>
  );
}

export function OrganizationOverview() {
  return (
    <RequireStaff>
      <OrganizationOverviewContent />
    </RequireStaff>
  );
}
