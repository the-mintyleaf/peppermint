"use client";

import { useParams } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import { SitesForm } from "../../form";
import { createSite, fetchSites } from "../../sites.api";
import { sitesQueryKeys } from "../../sites.queryKeys";
import type { CreateSitePayload, Site } from "../../sites.types";
import { sitesColumns } from "./sites.columns";

const TABS: DataTableShellTab[] = [
  { label: "All" },
  { label: "Active", filter: { is_active: "true" } },
  { label: "Inactive", filter: { is_active: "false" } },
];

export function SitesList() {
  const { id: orgId = "" } = useParams<{ id: string }>();

  return (
    <Paper
      p={0}
      withBorder
      radius="var(--mantine-radius-default)"
      h="calc(100vh - 16px)"
    >
      <ModalTableShell<Site>
        queryKey={sitesQueryKeys.list(orgId)}
        queryGetFn={(params) => fetchSites(orgId, params)}
        dataKey="data"
        paginationKey="meta"
        enableServerQuery
        columns={sitesColumns}
        moduleInfo={{
          name: "sites",
          label: "Sites",
          description: "Physical and logical locations for this organisation",
        }}
        idAccessor="id"
        createFormComponent={SitesForm}
        createModalTitle="Add Site"
        transformOnCreate={(values) => {
          const v = values as unknown as CreateSitePayload;
          return {
            name: v.name ?? "",
            code: v.code ?? "",
            site_type: v.site_type ?? "",
            address_line_1: v.address_line_1 ?? "",
            address_line_2: v.address_line_2 ?? "",
            city: v.city ?? "",
            province_state: v.province_state ?? "",
            district: v.district ?? "",
            country_code: v.country_code ?? "",
            postal_code: v.postal_code ?? "",
          };
        }}
        onCreateApi={(values) =>
          createSite(orgId, values as Parameters<typeof createSite>[1])
        }
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
        tabs={TABS}
        basePath={`/admin/organization/${orgId}/sites`}
      />
    </Paper>
  );
}
