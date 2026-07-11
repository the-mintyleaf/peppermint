"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Center,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@peppermint/ui";
import { ModalTableShell } from "@peppermint/admin";
import { BriefcaseIcon } from "@phosphor-icons/react/dist/csr/Briefcase";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";

import {
  buildUnitOptions,
  UnitPickerMenu,
} from "../../../_shared/components/UnitPickerMenu";
import { useUnitOptions } from "../../../_shared/components/UnitPickerSelect";
import { PositionEditForm, PositionForm } from "../../form";
import {
  createPosition,
  fetchPositions,
  updatePosition,
} from "../../positions.api";
import type {
  CreatePositionPayload,
  UpdatePositionPayload,
} from "../../positions.api";
import { positionsQueryKeys } from "../../positions.queryKeys";
import type { Position } from "../../positions.types";
import { PositionDetailDrawer } from "./components/PositionDetailDrawer";
import { getPositionsColumns } from "./positions.columns";

function PositionsListContent() {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [detailPosition, setDetailPosition] = useState<Position | null>(null);

  const { data: units, isFetching } = useUnitOptions(orgId);
  const unitOptions = useMemo(() => buildUnitOptions(units), [units]);

  // Default to the first unit rather than syncing state in an effect: the
  // selection stays `null` until the user picks one, and we resolve to the
  // first option for display and querying in the meantime.
  const activeUnitId = selectedUnitId ?? unitOptions[0]?.value ?? null;

  const columns = getPositionsColumns({ onViewDetails: setDetailPosition });

  return (
    <>
      {!activeUnitId ? (
        <Center h="100%" mih={300}>
          <Stack align="center" gap="xs" maw={360}>
            <ThemeIcon size={48} radius="xl" variant="light">
              <BriefcaseIcon size={24} weight="fill" aria-hidden />
            </ThemeIcon>
            <Title order={4} ta="center">
              {isFetching ? "Loading units…" : "No units available"}
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              Positions are scoped to a single unit. Create a unit in the
              organization structure to add positions.
            </Text>
          </Stack>
        </Center>
      ) : (
        <ModalTableShell<Position>
          key={activeUnitId}
          queryKey={positionsQueryKeys.list(activeUnitId)}
          queryGetFn={(params) => fetchPositions(activeUnitId, params)}
          dataKey="data"
          paginationKey="meta"
          columns={columns}
          moduleInfo={{
            name: "position",
            label: "Positions",
            description: "Institutional seats inside this unit",
          }}
          idAccessor="id"
          createFormComponent={PositionForm}
          editFormComponent={PositionEditForm}
          onCreateApi={(values) =>
            createPosition(
              activeUnitId,
              values as unknown as CreatePositionPayload,
            )
          }
          onEditApi={(values, record) =>
            updatePosition(
              record.id,
              values as unknown as UpdatePositionPayload,
            )
          }
          getErrorMessage={getApiErrorMessage}
          disableReviewButton
          pageSizes={[10, 20, 30, 50]}
          defaultPageSize={20}
          basePath={`/org/${orgId}/positions`}
          mainComponent={ModalPaper}
        />
      )}

      <PositionDetailDrawer
        position={detailPosition}
        opened={Boolean(detailPosition)}
        onClose={() => setDetailPosition(null)}
      />
    </>
  );
}

export function PositionsList() {
  return (
    <RequireStaff>
      <PositionsListContent />
    </RequireStaff>
  );
}
