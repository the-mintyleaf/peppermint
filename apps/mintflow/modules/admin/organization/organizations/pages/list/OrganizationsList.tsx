"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Center,
  ManageHeader,
  Modal,
  ModalPaper,
  ModuleHeader,
  notifications,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  useDisclosure,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";
import { useSelectedOrgStore } from "@/stores/selectedOrg.store";

import { CreateOrganizationForm } from "../../form";
import type { CreateOrganizationFormValues } from "../../form";
import {
  createOrganization,
  fetchOrganizations,
} from "../../organizations.api";
import { organizationsQueryKeys } from "../../organizations.queryKeys";
import type { Organization, OrganizationType } from "../../organizations.types";
import { OrganizationCard } from "./OrganizationCard";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "archived", label: "Archived" },
];

function OrganizationsListContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setOrg = useSelectedOrgStore((s) => s.setOrg);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>("all");
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [codeError, setCodeError] = useState<string | undefined>();

  const { data: organizations, isLoading } = useQuery({
    queryKey: organizationsQueryKeys.listKey(),
    queryFn: fetchOrganizations,
  });

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: (organization) => {
      void queryClient.invalidateQueries({
        queryKey: organizationsQueryKeys.listKey(),
      });
      notifications.show({
        color: "green",
        title: "Organization created",
        message: `"${organization.name}" was created as a draft.`,
      });
      closeCreate();
      setCodeError(undefined);
      handleSelect(organization);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      if (apiError.code === "ORGANIZATION_CODE_EXISTS") {
        setCodeError(getApiErrorMessage(error));
        return;
      }
      notifications.show({
        color: "red",
        title: "Couldn't create organization",
        message: getApiErrorMessage(error),
      });
    },
  });

  function handleSelect(organization: Organization) {
    setOrg({
      id: organization.id,
      name: organization.name,
      code: organization.code,
      status: organization.status,
      country_code: organization.country_code,
    });
    router.push(`/admin/organization/${organization.id}`);
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (organizations ?? []).filter((org) => {
      const matchesStatus =
        status === "all" || !status || org.status === status;
      const matchesSearch =
        !term ||
        org.name.toLowerCase().includes(term) ||
        org.code.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [organizations, search, status]);

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Organization", href: "/admin/organization" },
        ]}
      />
      <ModalPaper withBorder>
        <Box px="md">
          <ManageHeader
            title="Manage Organizations"
            count={organizations?.length}
            description="Institutions using MintFlow — pick one to manage its structure."
          />
        </Box>

        <Box px="md" pb="md">
          <Stack gap="md">
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 240 }}>
                <TextInput
                  placeholder="Search by name or code"
                  leftSection={
                    <MagnifyingGlassIcon size={13} aria-label="Search" />
                  }
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                  style={{ flex: 1, maxWidth: 320 }}
                  size="xs"
                />
                <Select
                  data={STATUS_FILTER_OPTIONS}
                  value={status}
                  onChange={setStatus}
                  size="xs"
                  w={160}
                />
              </div>
              <Button
                size="xs"
                color="brand"
                rightSection={<PlusIcon size={13} weight="bold" />}
                onClick={openCreate}
              >
                Create Organization
              </Button>
            </div>

            {isLoading ? (
              <Text size="sm" c="dimmed">
                Loading organizations...
              </Text>
            ) : filtered.length === 0 ? (
              <Center py={80}>
                <Stack align="center" gap="xs" maw={360}>
                  <ThemeIcon size={48} radius="xl" variant="light">
                    <BuildingsIcon size={24} weight="fill" aria-hidden />
                  </ThemeIcon>
                  <Title order={4} ta="center">
                    {organizations?.length
                      ? "No organizations match your filters."
                      : "No organizations have been created yet."}
                  </Title>
                  {!organizations?.length && (
                    <Text size="sm" c="dimmed" ta="center">
                      Create the first organization to start building its
                      structure.
                    </Text>
                  )}
                </Stack>
              </Center>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
                {filtered.map((organization) => (
                  <OrganizationCard
                    key={organization.id}
                    organization={organization}
                    onSelect={handleSelect}
                  />
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Box>
      </ModalPaper>

      <Modal
        opened={createOpened}
        onClose={() => {
          closeCreate();
          setCodeError(undefined);
        }}
        title="Create Organization"
      >
        <CreateOrganizationForm
          onSubmit={(values: CreateOrganizationFormValues) =>
            createMutation.mutate({
              name: values.name,
              code: values.code,
              organization_type: values.organization_type as OrganizationType,
              legal_name: values.legal_name || undefined,
              short_name: values.short_name || undefined,
              description: values.description || undefined,
              country_code: values.country_code || undefined,
              timezone: values.timezone || undefined,
            })
          }
          isLoading={createMutation.isPending}
          codeError={codeError}
        />
      </Modal>
    </>
  );
}

export function OrganizationsList() {
  return (
    <RequireStaff>
      <OrganizationsListContent />
    </RequireStaff>
  );
}
