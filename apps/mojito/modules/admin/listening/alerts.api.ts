import type { QueryParams } from "@zetsel/admin";
import { delay, paginate } from "../shared/mock.utils";
import { fetchAlerts, markAlertRead, markAllAlertsRead } from "./listening.api";
import type { AlertRow, AlertsFetchResponse } from "./alerts.types";

export async function fetchAlertsPaginated(
  params?: QueryParams,
): Promise<AlertsFetchResponse> {
  await delay();
  let items = (await fetchAlerts()) as AlertRow[];

  const readFilter = params?.filters?.read;
  if (readFilter === "unread") items = items.filter((a) => !a.read);
  if (readFilter === "read") items = items.filter((a) => a.read);

  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter((a) => a.text.toLowerCase().includes(q));
  }

  return paginate(items, params?.page ?? 1, params?.pageSize ?? 20);
}

export async function markAlertReadById(id: string): Promise<void> {
  return markAlertRead(id);
}

export async function markAllAlertsReadApi(): Promise<void> {
  return markAllAlertsRead();
}
