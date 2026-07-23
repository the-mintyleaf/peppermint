"use client";

import Link from "next/link";
import {
  Button,
  Divider,
  Group,
  ModalPaper,
  ModuleHeader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { UserListIcon } from "@phosphor-icons/react/dist/csr/UserList";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { RequireAuth } from "@/components/RequireAuth";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { ApplicantStatusPanel } from "./components/ApplicantStatusPanel";
import { JourneyStagePanel } from "./components/JourneyStagePanel";
import { RecentApplicantsPanel } from "./components/RecentApplicantsPanel";

function HomeContent() {
  const { user, isAdmin, isLeadManager, authorityType } = useCurrentUser();
  // Same admin/lead_manager, never-superadmin rule as the modules themselves
  // (`RequireLeadAccess`) — a Superadmin can't open either module, so
  // widgets summarizing their data don't belong on their Home either. Not
  // `isAdmin` alone — that flag is true for `superadmin` too.
  const canSeeApplicantWidgets = authorityType === "admin" || isLeadManager;

  return (
    <>
      <ModuleHeader breadcrumbItems={[{ label: "Home", href: "/admin" }]} />
      <ModalPaper withBorder>
        <Stack gap="md" p="lg">
          <Title order={3}>
            Welcome{user ? `, ${user.display_name || user.username}` : ""}
          </Title>
          <Text size="sm" c="dimmed">
            Grandway identity, access and audit administration.
          </Text>
          {isAdmin ? (
            <Group gap="sm">
              <Button
                component={Link}
                href="/admin/authenticate/users"
                leftSection={<UserListIcon size={16} aria-hidden />}
              >
                Manage users
              </Button>
              <Button
                component={Link}
                href="/admin/audit"
                variant="default"
                leftSection={
                  <ClockCounterClockwiseIcon size={16} aria-hidden />
                }
              >
                View audit log
              </Button>
            </Group>
          ) : null}

          {canSeeApplicantWidgets ? (
            <>
              <Divider />
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <ApplicantStatusPanel />
                <JourneyStagePanel />
              </SimpleGrid>
              <RecentApplicantsPanel />
            </>
          ) : null}
        </Stack>
      </ModalPaper>
    </>
  );
}

export function ModuleHome() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  );
}
