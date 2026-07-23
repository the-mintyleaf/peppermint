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
 * Gate admin-area content behind the Grandway `admin`/`superadmin` authority tiers.
 * `lead_manager` accounts get an access-forbidden panel. Superadmin-only pages (e.g.
 * account management targeting admins) gate separately within their own module.
 */
export function RequireStaff({ children }: RequireStaffProps) {
  const { isAdmin, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <Center h="100%" mih={400}>
        <Loader size="sm" />
      </Center>
    );
  }

  // A failed `/me` (e.g. a revoked session that couldn't refresh) isn't a permission
  // problem — offer a path back to sign-in rather than a misleading "Forbidden".
  if (isError) {
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
                Your session couldn&apos;t be verified
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                Please sign in again to continue.
              </Text>
              <Button component={Link} href="/" mt="sm">
                Back to sign in
              </Button>
            </Stack>
          </Center>
        </ModalPaper>
      </>
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
