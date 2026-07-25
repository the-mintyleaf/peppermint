"use client";

import { useState } from "react";
import {
  Button,
  Drawer,
  Group,
  Skeleton,
  Stack,
  Switch,
  Text,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useInstitutionCampuses } from "../../../../../institutions.hooks";
import { CampusCard } from "./CampusCard";
import { CampusForm } from "./CampusForm";
import type { CampusManagerProps } from "./CampusManager.types";

/**
 * The campuses of one institution — nested list, nested create, un-nested edit /
 * withdraw. Opened from a provider row. Add/edit/withdraw are gated on `canManage`
 * (Admin); a Lead Manager sees a read-only list.
 */
export function CampusManager({
  institution,
  opened,
  onClose,
  canManage,
}: CampusManagerProps) {
  const institutionId = institution?.id ?? null;
  const {
    data: campuses = [],
    isLoading,
    isError,
    refetch,
  } = useInstitutionCampuses(opened ? institutionId : null);

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showWithdrawn, setShowWithdrawn] = useState(false);

  const visible = showWithdrawn
    ? campuses
    : campuses.filter((c) => c.availability_status !== "inactive");

  const handleClose = () => {
    setAdding(false);
    setEditingId(null);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      position="right"
      size="lg"
      title={institution ? `Campuses · ${institution.name}` : "Campuses"}
    >
      {!institutionId ? null : isError ? (
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed" ta="center">
            Couldn&apos;t load campuses.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      ) : (
        <Stack gap="sm">
          <Group justify="space-between">
            <Switch
              size="sm"
              label="Show withdrawn"
              checked={showWithdrawn}
              onChange={(e) => setShowWithdrawn(e.currentTarget.checked)}
              disabled={isLoading}
            />
            {canManage ? (
              <Button
                size="xs"
                leftSection={<PlusIcon size={14} aria-hidden />}
                onClick={() => {
                  setEditingId(null);
                  setAdding(true);
                }}
                disabled={isLoading || adding}
              >
                Add campus
              </Button>
            ) : null}
          </Group>

          {isLoading ? (
            <Stack gap="xs">
              <Skeleton height={64} radius="md" />
              <Skeleton height={64} radius="md" />
            </Stack>
          ) : (
            <Stack gap="xs">
              {adding && canManage ? (
                <CampusForm
                  mode="create"
                  institutionId={institutionId}
                  onDone={() => setAdding(false)}
                />
              ) : null}

              {visible.length === 0 && !adding ? (
                <Text size="sm" c="dimmed">
                  {campuses.length === 0
                    ? "No campuses yet."
                    : "All campuses are withdrawn. Turn on “Show withdrawn” to see them."}
                </Text>
              ) : (
                visible.map((campus) =>
                  editingId === campus.id && canManage ? (
                    <CampusForm
                      key={campus.id}
                      mode="edit"
                      institutionId={institutionId}
                      initialEntry={campus}
                      onDone={() => setEditingId(null)}
                    />
                  ) : (
                    <CampusCard
                      key={campus.id}
                      campus={campus}
                      institutionId={institutionId}
                      canManage={canManage}
                      onEdit={() => {
                        setAdding(false);
                        setEditingId(campus.id);
                      }}
                    />
                  ),
                )
              )}
            </Stack>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
