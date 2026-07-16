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
  Group,
} from "@peppermint/ui";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { RequireStaffProps } from "./RequireStaff.types";
import { LockIcon } from "@phosphor-icons/react/dist/ssr";

export function RequireStaff({ children }: RequireStaffProps) {
  const { isStaff, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <Center h="100%" mih={400}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (false && !isStaff) {
    return (
      <>
        <ModuleHeader
          breadcrumbItems={[
            {
              label: "Home",
              href: "/admin",
            },
          ]}
          right={
            <Group gap="xs">
              <LockIcon
                size={14}
                weight="fill"
                color="var(--mantine-color-gray-0)"
              />
              <Text size="xs" c="gray.0">
                You currently do not have permission to view this area.
              </Text>

              <Button
                size="xs"
                rightSection={
                  <CaretRightIcon
                    size={14}
                    color="var(--mantine-color-gray-0)"
                  />
                }
              >
                Request Access
              </Button>
            </Group>
          }
        />

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
