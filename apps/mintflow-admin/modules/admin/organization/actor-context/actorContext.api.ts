import api from "@/lib/api";

import type { ActorContext } from "./actorContext.types";

export interface FetchActorContextParams {
  userId: string;
  organizationId?: string;
  atTime?: string;
}

export async function fetchActorContext({
  userId,
  organizationId,
  atTime,
}: FetchActorContextParams): Promise<ActorContext> {
  const { data } = await api.get<ActorContext>(
    "/api/v1/organization/actor-context/",
    {
      params: {
        user_id: userId,
        organization_id: organizationId || undefined,
        at_time: atTime || undefined,
      },
    },
  );
  return data;
}
