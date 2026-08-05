"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { RequireCapability } from "@/components/RequireCapability";
import { useDeepLinkSearch } from "@/lib/useDeepLinkSearch";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import {
  createClient,
  fetchClients,
  getClient,
  updateClient,
} from "../../clients.api";
import { clientQueryKeys } from "../../clients.queryKeys";
import type {
  ClientRow,
  CreateClientValues,
  UpdateClientValues,
} from "../../clients.types";
import { ClientForm, toCreatePayload, toUpdatePayload } from "../../form";
import { getClientsColumns } from "./clients.columns";
import { ClientDetailDrawer } from "./components/ClientDetailDrawer";

// Retired (`inactive`) clients still appear in the unfiltered "All" tab — the
// status badge de-emphasizes them rather than hiding them (§3/§5).
const tabs: DataTableShellTab[] = [
  { label: "All", icon: BuildingsIcon },
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
  { label: "Retired", icon: ProhibitIcon, filter: { status: "inactive" } },
];

function ClientDirectoryContent() {
  const { authorityType } = useCurrentUser();
  // Writes are Admin-only; a lead manager (or superadmin) gets
  // `CLIENTS_ACTOR_FORBIDDEN` server-side, so the create/edit controls are
  // withheld rather than shown and failed (§1). Checked on the exact tier —
  // not `isAdmin`, which also covers superadmin.
  const isAdmin = authorityType === "admin";
  // Global-search deep link — clients open in a drawer, not on their own route.
  const deepLinkSearch = useDeepLinkSearch();
  const [detailClientId, setDetailClientId] = useState<string | null>(null);

  const columns = getClientsColumns({
    onViewDetails: (client) => setDetailClientId(client.id),
  });

  return (
    <>
      <ModalTableShell<ClientRow, CreateClientValues, UpdateClientValues>
        queryKey={clientQueryKeys.lists()}
        queryGetFn={fetchClients}
        enableServerQuery
        initialSearch={deepLinkSearch}
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={columns}
        moduleInfo={{
          name: "client",
          label: "Clients",
          description: "Partner directory — agencies, schools, and companies",
        }}
        createModalTitle="Add client"
        editModalTitle="Edit client"
        createFormComponent={isAdmin ? ClientForm : undefined}
        editFormComponent={isAdmin ? ClientForm : undefined}
        // The list row is trimmed — fetch the full detail before opening the
        // edit modal, carrying the list-only phone through.
        onEditTrigger={async (record) => {
          const detail = await getClient(record.id);
          return {
            ...detail,
            primary_contact_number: record.primary_contact_number,
          };
        }}
        onCreateApi={
          isAdmin
            ? (values) => createClient(toCreatePayload(values))
            : undefined
        }
        // Only changed fields are sent (PATCH rejects a whole-object round-trip).
        onEditApi={
          isAdmin
            ? (values, record) =>
                updateClient(record.id, toUpdatePayload(values, record))
            : undefined
        }
        getErrorMessage={getApiErrorMessage}
        disableReviewButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        tabs={tabs}
        basePath="/admin/clients"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />

      <ClientDetailDrawer
        clientId={detailClientId}
        opened={detailClientId !== null}
        onClose={() => setDetailClientId(null)}
      />
    </>
  );
}

/** Reads are shared (admin + lead_manager); superadmin is refused everything (§1). */
export function ClientDirectory() {
  return (
    <RequireCapability capability="clients">
      <ClientDirectoryContent />
    </RequireCapability>
  );
}
