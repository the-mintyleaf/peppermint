"use client";

import { useParams } from "next/navigation";
import {
  Center,
  Group,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Tabs,
  Text,
  Title,
  useQuery,
} from "@peppermint/ui";
import { BriefcaseIcon } from "@phosphor-icons/react/dist/csr/Briefcase";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";

import { RequireStaff } from "@/components/RequireStaff";

import { MembershipStatusBadge } from "../../../_shared/components/MembershipStatusBadge";
import { fetchMembership, fetchUserSummary } from "../../members.api";
import { membersQueryKeys } from "../../members.queryKeys";
import { MemberStatusMenu } from "./components/MemberStatusMenu";
import { PositionAssignmentsTab } from "./components/PositionAssignmentsTab";
import { UnitMembershipsTab } from "./components/UnitMembershipsTab";

function MemberViewContent() {
  const { orgId = "", membershipId = "" } = useParams<{
    orgId: string;
    membershipId: string;
  }>();

  const { data: membership, isLoading } = useQuery({
    queryKey: membersQueryKeys.detail(membershipId),
    queryFn: () => fetchMembership(membershipId),
    enabled: Boolean(membershipId),
  });

  const { data: userSummary } = useQuery({
    queryKey: membersQueryKeys.userSummary(membership?.user ?? ""),
    queryFn: () => fetchUserSummary(membership?.user as string),
    enabled: Boolean(membership?.user),
  });

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Organization", href: "/admin/organization" },
          { label: "Members", href: `/admin/organization/${orgId}/members` },
          { label: userSummary?.display_name ?? "Member", href: "#" },
        ]}
      />
      <ModalPaper withBorder>
        {isLoading || !membership ? (
          <Center h="100%" mih={400}>
            <Loader size="sm" />
          </Center>
        ) : (
          <Stack gap="md" p="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Group gap="xs" align="center" mb={4}>
                  <Title order={4}>
                    {userSummary?.display_name ?? membership.user}
                  </Title>
                  <MembershipStatusBadge
                    status={membership.membership_status}
                  />
                </Group>
                <Text size="xs" c="dimmed">
                  {userSummary?.username ?? membership.user}
                  {membership.employee_code
                    ? ` · ${membership.employee_code}`
                    : ""}
                </Text>
              </div>
              <MemberStatusMenu membership={membership} />
            </Group>

            <Tabs defaultValue="units">
              <Tabs.List>
                <Tabs.Tab
                  value="units"
                  leftSection={<TreeStructureIcon size={14} />}
                >
                  Unit Memberships
                </Tabs.Tab>
                <Tabs.Tab
                  value="positions"
                  leftSection={<BriefcaseIcon size={14} />}
                >
                  Position Assignments
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="units" pt="md">
                <UnitMembershipsTab
                  organizationId={orgId}
                  membershipId={membershipId}
                />
              </Tabs.Panel>
              <Tabs.Panel value="positions" pt="md">
                <PositionAssignmentsTab
                  organizationId={orgId}
                  membershipId={membershipId}
                />
              </Tabs.Panel>
            </Tabs>
          </Stack>
        )}
      </ModalPaper>
    </>
  );
}

export function MemberView() {
  return (
    <RequireStaff>
      <MemberViewContent />
    </RequireStaff>
  );
}
