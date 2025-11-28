"use client";

import { queryOptions } from "@tanstack/react-query";
import type { TokenGetter } from "@/lib/api-token-provider";
import { leadItemKeys } from "./keys";
import {
  apiListLeadItemsForAgent,
  apiGetLeadItem,
} from "./apis";
import type { ListLeadItemsQuery } from "./types";

/**
 * Build query options for listing lead items of an agent.
 * Pass the result directly to `useQuery(opts)` (TanStack v5).
 */
export function leadItemsForAgentQuery(
  agentId: string,
  params: ListLeadItemsQuery = {},
  getToken?: TokenGetter
) {
  return queryOptions({
    queryKey: leadItemKeys.agentList(agentId, params),
    queryFn: () => apiListLeadItemsForAgent(agentId, params, getToken),
    enabled: Boolean(agentId),
  });
}

/**
 * Build query options for a single lead item.
 */
export function leadItemQuery(id: string, getToken?: TokenGetter) {
  return queryOptions({
    queryKey: leadItemKeys.detail(id),
    queryFn: () => apiGetLeadItem(id, getToken),
    enabled: Boolean(id),
  });
}
