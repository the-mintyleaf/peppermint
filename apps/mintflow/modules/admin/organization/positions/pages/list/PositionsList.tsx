"use client";

import { useState } from "react";
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

import { UnitPickerSelect } from "../../../_shared/components/UnitPickerSelect";
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
  const [unitId, setUnitId] = useState<string | null>(null);
  const [detailPosition, setDetailPosition] = useState<Position | null>(null);

  const columns = getPositionsColumns({ onViewDetails: setDetailPosition });

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Organization", href: "/admin/organization" },
          { label: "Positions", href: "#" },
        ]}
      />
      <ModalPaper withBorder>
        <div style={{ padding: "16px 16px 0" }}>
          <UnitPickerSelect
            organizationId={orgId}
            label="Unit"
            placeholder="Select a unit to view its positions"
            clearable={false}
            value={unitId}
            onChange={setUnitId}
          />
        </div>

        {!unitId ? (
          <Center h="100%" mih={300}>
            <Stack align="center" gap="xs" maw={360}>
              <ThemeIcon size={48} radius="xl" variant="light">
                <BriefcaseIcon size={24} weight="fill" aria-hidden />
              </ThemeIcon>
              <Title order={4} ta="center">
                Select a unit
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                Positions are scoped to a single unit. Choose one above to view
                or create positions.
              </Text>
            </Stack>
          </Center>
        ) : (
          <ModalTableShell<Position>
            key={unitId}
            queryKey={positionsQueryKeys.list(unitId)}
            queryGetFn={(params) => fetchPositions(unitId, params)}
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
              createPosition(unitId, values as unknown as CreatePositionPayload)
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
          />
        )}
      </ModalPaper>
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
