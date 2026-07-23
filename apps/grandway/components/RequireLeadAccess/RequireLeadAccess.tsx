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
import type { RequireLeadAccessProps } from "./RequireLeadAccess.types";

/**
 * Gate lead-management content behind the `admin`/`lead_manager` authority tiers.
 * The leads backend deliberately 403s every `superadmin` call (`LEADS_ACTOR_FORBIDDEN`)
 * to keep the platform-recovery credential out of business data, so `RequireStaff`
 * (which allows `superadmin` and excludes `lead_manager`) is the wrong gate here —
 * this is its mirror image.
 */
export function RequireLeadAccess({ children }: RequireLeadAccessProps) {
  const { authorityType, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <Center h="100%" mih={400}>
        <Loader size="sm" />
      </Center>
    );
  }

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

  const allowed = authorityType === "admin" || authorityType === "lead_manager";

  if (!allowed) {
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
