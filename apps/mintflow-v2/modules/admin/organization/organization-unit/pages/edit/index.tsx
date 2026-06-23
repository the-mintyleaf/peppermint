"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Center, Loader, Paper } from "@peppermint/ui";
import { OrgUnitForm } from "../../form";
import { fetchOrgUnit } from "../../organization-unit.api";

export function OrgUnitEdit() {
  const { id } = useParams<{ id: string }>();

  const { data: unit, isLoading } = useQuery({
    queryKey: ["org-units.detail", id],
    queryFn: () => fetchOrgUnit(id),
    enabled: !!id,
  });

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      {isLoading || !unit ? (
        <Center h="100%">
          <Loader />
        </Center>
      ) : (
        <OrgUnitForm
          onBack={() => history.back()}
          initialValues={unit}
        />
      )}
    </Paper>
  );
}
