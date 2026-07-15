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
import type { RequireAuthProps } from "./RequireAuth.types";

/**
 * Gate content behind *any* authenticated grandway account (staff/admin/superadmin).
 * Unlike `RequireStaff` (which requires the admin baseline), this only guards against
 * an unverifiable session — the applicant list, overview, and addresses are staff-
 * reachable per the contract, while object-level role rules live in each section.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <Center h="100%" mih={400}>
        <Loader size="sm" />
      </Center>
    );
  }

  // A failed `/me` (e.g. a revoked session that couldn't refresh) isn't a permission
  // problem — offer a path back to sign-in rather than rendering the gated content.
  if (isError || !user) {
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

  return <>{children}</>;
}
