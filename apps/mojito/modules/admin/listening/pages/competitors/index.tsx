"use client";

import { ModalTableShell } from "@peppermint/admin";
import { Paper, LineChart } from "@peppermint/ui";
import {
  fetchCompetitorsPaginated,
  createCompetitor,
  deleteCompetitorById,
} from "../../competitors.api";
import { competitorsColumns } from "./competitors.columns";
import { competitorQueryKeys } from "../../competitors.queryKeys";
import { CompetitorForm } from "../../form/CompetitorForm";
import type { CompetitorRow } from "../../competitors.types";

const BASE_PATH = "/admin/listening/competitors";

const MODULE_INFO = {
  name: "competitors",
  label: "Competitors",
  description: "Monitor competitor accounts and mention volume",
};

function VolumeChart({ series }: { series: CompetitorRow["volumeSeries"] }) {
  const data = series.map((p) => ({
    date:
      p.date instanceof Date
        ? p.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : String(p.date),
    volume: p.value,
  }));

  return (
    <LineChart
      h={100}
      data={data}
      dataKey="date"
      series={[{ name: "volume", color: "red", label: "Mentions" }]}
      curveType="natural"
      withDots={false}
    />
  );
}

export function CompetitorsList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ModalTableShell<CompetitorRow>
        queryKey={competitorQueryKeys.list()}
        queryGetFn={fetchCompetitorsPaginated}
        dataKey="data"
        paginationKey="meta"
        columns={competitorsColumns}
        moduleInfo={MODULE_INFO}
        idAccessor="id"
        createFormComponent={CompetitorForm}
        onCreateApi={(values) =>
          createCompetitor(values as Partial<CompetitorRow>)
        }
        onDeleteApi={(id) => deleteCompetitorById(String(id))}
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
        basePath={BASE_PATH}
        rowExpansion={{
          allowMultiple: false,
          content: ({ record }) => <VolumeChart series={record.volumeSeries} />,
        }}
      />
    </Paper>
  );
}
