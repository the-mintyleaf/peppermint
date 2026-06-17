"use client";

import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { Paper, LineChart } from "@peppermint/ui";
import { HashIcon } from "@phosphor-icons/react/dist/csr/Hash";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import {
  fetchKeywordsPaginated,
  createKeyword,
  deleteKeywordById,
} from "../../keywords.api";
import { keywordsColumns } from "./keywords.columns";
import { keywordQueryKeys } from "../../keywords.queryKeys";
import { KeywordForm } from "../../form/KeywordForm";
import type { KeywordRow } from "../../keywords.types";

const BASE_PATH = "/admin/listening/keywords";

const MODULE_INFO = {
  name: "keywords",
  label: "Keywords & Hashtags",
  description: "Track keywords and hashtags across social platforms",
};

const tabs: DataTableShellTab[] = [
  { label: "All", icon: MagnifyingGlassIcon },
  { label: "Keywords", icon: MagnifyingGlassIcon, filter: { kind: "keyword" } },
  { label: "Hashtags", icon: HashIcon, filter: { kind: "hashtag" } },
];

function VolumeChart({ series }: { series: KeywordRow["volumeSeries"] }) {
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
      series={[{ name: "volume", color: "blue", label: "Volume" }]}
      curveType="natural"
      withDots={false}
    />
  );
}

export function KeywordsList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ModalTableShell<KeywordRow>
        queryKey={keywordQueryKeys.list()}
        queryGetFn={fetchKeywordsPaginated}
        dataKey="data"
        paginationKey="meta"
        columns={keywordsColumns}
        moduleInfo={MODULE_INFO}
        idAccessor="id"
        createFormComponent={KeywordForm}
        onCreateApi={(values) => createKeyword(values as Partial<KeywordRow>)}
        onDeleteApi={(id) => deleteKeywordById(String(id))}
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
        tabs={tabs}
        basePath={BASE_PATH}
        rowExpansion={{
          allowMultiple: false,
          content: ({ record }) => <VolumeChart series={record.volumeSeries} />,
        }}
      />
    </Paper>
  );
}
