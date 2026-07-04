"use client";

import {
  ModalPaper,
  ModuleHeader,
  ScrollArea,
  SimpleGrid,
  Stack,
} from "@peppermint/ui";
import { MfaCard } from "./components/MfaCard";
import { PasswordCard } from "./components/PasswordCard";
import { ProfileCard } from "./components/ProfileCard";
import { SessionsCard } from "./components/SessionsCard";

export function AccountSecurityView() {
  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Account & Security", href: "/admin/account/security" },
        ]}
      />
      <ModalPaper withBorder>
        <ScrollArea h="100%">
          <Stack gap="lg" p="lg" maw={1100} mx="auto">
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              <ProfileCard />
              <PasswordCard />
              <MfaCard />
              <SessionsCard />
            </SimpleGrid>
          </Stack>
        </ScrollArea>
      </ModalPaper>
    </>
  );
}
