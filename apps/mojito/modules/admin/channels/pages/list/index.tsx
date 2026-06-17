"use client";

import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import { ShareNetworkIcon } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { MinusCircleIcon } from "@phosphor-icons/react/dist/csr/MinusCircle";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";
import { fetchChannels, createChannel, updateChannel, deleteChannel } from "../../channels.api";
import { channelsColumns } from "./channels.columns";
import { channelQueryKeys } from "../../channels.queryKeys";
import { ChannelForm } from "../../form/ChannelForm";
import type { Channel } from "../../channels.types";

const tabs: DataTableShellTab[] = [
  { label: "All Channels", icon: ShareNetworkIcon },
  { label: "Connected", icon: CheckCircleIcon, filter: { status: "connected" } },
  { label: "Disconnected", icon: MinusCircleIcon, filter: { status: "disconnected" } },
  { label: "Expired", icon: ClockIcon, filter: { status: "expired" } },
  { label: "Error", icon: WarningCircleIcon, filter: { status: "error" } },
];

export function ChannelsList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ModalTableShell<Channel>
        queryKey={channelQueryKeys.list()}
        queryGetFn={fetchChannels}
        dataKey="data"
        paginationKey="meta"
        columns={channelsColumns}
        moduleInfo={{
          name: "channels",
          label: "Channels",
          description: "Manage your connected social media accounts",
        }}
        idAccessor="id"
        createFormComponent={ChannelForm}
        editFormComponent={ChannelForm}
        onCreateApi={(values) => createChannel(values)}
        onEditApi={(values) => updateChannel(values.id, values)}
        onDeleteApi={(id) => deleteChannel(String(id))}
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
        tabs={tabs}
        basePath="/admin/channels"
      />
    </Paper>
  );
}
