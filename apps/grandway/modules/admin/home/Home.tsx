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
import { RequireAuth } from "@/components/RequireAuth";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";

function HomeContent() {
  const { user, isAdmin } = useCurrentUser();

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
