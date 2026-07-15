"use client";

import Link from "next/link";
import {
  Button,
  Center,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@peppermint/ui";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { RequireStaffProps } from "./RequireStaff.types";

/**
 * Gate admin-area content behind the grandway `admin`/`superadmin` roles. `staff`
 * accounts get an access-forbidden panel. Superadmin-only pages gate separately in
 * their own module (this only enforces the admin baseline).
 */
export function RequireStaff({ children }: RequireStaffProps) {
  const { isAdmin, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <Center h="100%" mih={400}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <ModuleHeader breadcrumbItems={[{ label: "Home", href: "/admin" }]} />
        <ModalPaper withBorder>
          <Center h="100%" mih={400}>
            <Stack align="center" gap="xs" maw={360}>
              <ThemeIcon size={48} radius="xl" color="red" variant="light">
                <LockKeyIcon size={24} weight="fill" aria-hidden />
              </ThemeIcon>
              <Title order={4} ta="center">
                Access Forbidden
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                You don&apos;t have permission to view this area. Contact an
                administrator if you believe this is a mistake.
              </Text>
              <Button component={Link} href="/admin" mt="sm">
                Go to Homepage
              </Button>
            </Stack>
          </Center>
        </ModalPaper>
      </>
    );
  }

  return <>{children}</>;
}
