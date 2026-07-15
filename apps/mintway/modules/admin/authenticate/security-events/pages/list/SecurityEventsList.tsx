"use client";

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
import { DataTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import Link from "next/link";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { SignInIcon } from "@phosphor-icons/react/dist/csr/SignIn";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { SecurityEvent } from "../../securityEvents.types";
import { fetchSecurityEvents } from "../../securityEvents.api";
import { securityEventsQueryKeys } from "../../securityEvents.queryKeys";
import { getSecurityEventsColumns } from "./securityEvents.columns";

const TABS: DataTableShellTab[] = [
  { label: "All", icon: ListIcon },
  {
    label: "Login failures",
    icon: SignInIcon,
    filter: { event_type: "login_failed" },
  },
  {
    label: "Password changes",
    icon: KeyIcon,
    filter: { event_type: "password_changed" },
  },
  {
    label: "Suspensions",
    icon: PauseCircleIcon,
    filter: { event_type: "account_suspended" },
  },
];

function Forbidden() {
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
              Superadmin only
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              The security-event feed is restricted to the superadmin.
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

export function SecurityEventsList() {
  const { isSuperadmin, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <Center h="100%" mih={400}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (!isSuperadmin) {
    return <Forbidden />;
  }

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          {
            label: "Security Events",
            href: "/admin/authenticate/security-events",
          },
        ]}
      />
      <ModalPaper withBorder>
        <DataTableShell<SecurityEvent>
          queryKey={securityEventsQueryKeys.lists()}
          queryGetFn={fetchSecurityEvents}
          enableServerQuery
          dataKey="data"
          paginationKey="meta"
          idAccessor="id"
          columns={getSecurityEventsColumns()}
          moduleInfo={{
            name: "security-event",
            label: "Security Events",
            description: "Append-only authentication audit feed, newest first",
          }}
          disableActions
          disableCreateButton
          pageSizes={[10, 20, 30, 50]}
          defaultPageSize={20}
          tabs={TABS}
          basePath="/admin/authenticate/security-events"
        />
      </ModalPaper>
    </>
  );
}
