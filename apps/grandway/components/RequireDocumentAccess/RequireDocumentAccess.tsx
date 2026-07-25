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
import type { RequireDocumentAccessProps } from "./RequireDocumentAccess.types";

/**
 * Gate the document stack (documents, document-history, document-templates) behind the
 * `admin` tier **exactly**. Unlike `RequireStaff` (admin OR superadmin) and
 * `RequireLeadAccess` (admin OR lead_manager), the three document modules are Admin-only
 * with reads included — the backend 403s both `superadmin` and `lead_manager` on every
 * route (`documents/docs/SECURITY.md`; `DOCUMENTS_ACTOR_FORBIDDEN`). Neither existing
 * gate fits, so this is the exact-admin gate. Non-admins never see a read-only shell —
 * they are shown the forbidden panel here and the nav entry is hidden entirely.
 */
export function RequireDocumentAccess({
  children,
}: RequireDocumentAccessProps) {
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

  if (authorityType !== "admin") {
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
