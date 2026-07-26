"use client";

import Link from "next/link";
import {
  Button,
  Group,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { UserListIcon } from "@phosphor-icons/react/dist/csr/UserList";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";

/**
 * The `/admin` home for a **superadmin**. The Placement dashboard is lead-access only
 * (the leads backend 403s every superadmin call — `DASHBOARDS_ACTOR_FORBIDDEN`), so a
 * superadmin can't see it; sending them to the dashboard would dead-end on "Access
 * Forbidden". Instead they land here — the platform-recovery credential's home is the
 * identity/access and audit surfaces it actually owns.
 */
export function SuperadminLanding() {
  const { user } = useCurrentUser();

  return (
    <>
      <ModuleHeader breadcrumbItems={[{ label: "Home", href: "/admin" }]} />
      <ModalPaper withBorder>
        <Stack gap="md" p="lg">
          <Title order={3}>
            Welcome{user ? `, ${user.display_name || user.username}` : ""}
          </Title>
          <Text size="sm" c="dimmed" maw={520}>
            You&apos;re signed in with the platform superadmin credential.
            Business operations dashboards are scoped to admin and lead-manager
            accounts — your home is identity, access and the audit trail.
          </Text>
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
              leftSection={<ClockCounterClockwiseIcon size={16} aria-hidden />}
            >
              View audit log
            </Button>
          </Group>
        </Stack>
      </ModalPaper>
    </>
  );
}
