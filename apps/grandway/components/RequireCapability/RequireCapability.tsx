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

import { useCapabilities } from "@/config/access";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { RequireCapabilityProps } from "./RequireCapability.types";

/**
 * The one route gate. Every `Require*` in this folder is a thin alias over it, so the
 * loading / unverifiable-session / forbidden panels exist once rather than four times.
 *
 * The rule itself is never written here — it comes from `config/access`, which is the
 * only module that reads `authority_type`. To gate a new area, add a capability there
 * and pass its name.
 */
export function RequireCapability({
  capability,
  children,
}: RequireCapabilityProps) {
  const { user, isLoading, isError } = useCurrentUser();
  const capabilities = useCapabilities();

  if (isLoading) {
    return (
      <Center h="100%" mih={400}>
        <Loader size="sm" />
      </Center>
    );
  }

  // A failed `/me` (e.g. a revoked session that couldn't refresh) isn't a permission
  // problem — offer a path back to sign-in rather than a misleading "Forbidden".
  if (isError || !user) {
    return <GatePanel variant="unverified" />;
  }

  if (capability && !capabilities[capability]) {
    return <GatePanel variant="forbidden" />;
  }

  return <>{children}</>;
}

function GatePanel({ variant }: { variant: "unverified" | "forbidden" }) {
  const unverified = variant === "unverified";

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
              {unverified
                ? "Your session couldn't be verified"
                : "Access Forbidden"}
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              {unverified
                ? "Please sign in again to continue."
                : "You don't have permission to view this area. Contact an administrator if you believe this is a mistake."}
            </Text>
            <Button component={Link} href={unverified ? "/" : "/admin"} mt="sm">
              {unverified ? "Back to sign in" : "Go to Homepage"}
            </Button>
          </Stack>
        </Center>
      </ModalPaper>
    </>
  );
}
