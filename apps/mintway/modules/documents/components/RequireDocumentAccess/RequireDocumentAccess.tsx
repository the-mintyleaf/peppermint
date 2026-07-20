"use client";

import Link from "next/link";
import {
  Button,
  Center,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@peppermint/ui";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { ModuleNotFound } from "@/modules/admin/not-found";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { RequireDocumentAccessProps } from "./RequireDocumentAccess.types";

/**
 * Access gate for every document / signature surface.
 *
 * Documents, revisions, print events and signatures are admin/superadmin-only, and the
 * backend answers staff with a **non-disclosing 404, never a 403** so staff cannot infer
 * that a document exists (`docs/applicants/integration/overview.md` §Role model). The
 * client must not undo that: a "Forbidden"/lock panel would confirm the surface is real.
 * So a non-admin sees exactly the app's not-found treatment (`ModuleNotFound`, the same
 * component `app/admin/not-found.tsx` renders) — indistinguishable from a bad URL.
 *
 * A failed `/me` is a different thing (the session couldn't be verified, not a role
 * decision), so it keeps its own sign-in path rather than masquerading as not-found.
 */
export function RequireDocumentAccess({
  children,
}: RequireDocumentAccessProps) {
  const { isAdmin, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <Center h="100%" mih={400}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError) {
    return (
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
    );
  }

  if (!isAdmin) {
    return <ModuleNotFound />;
  }

  return <>{children}</>;
}
