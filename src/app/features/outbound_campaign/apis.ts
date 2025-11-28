// src/app/features/outbound_campaign/apis.ts
import { z } from "zod";
import {
  CreateOutboundCampaignBodySchema,
  OutboundCampaignEntitySchema,
  PaginatedSchema,
  ListQuerySchema,
  SetStatusBodySchema,
  UpdateOutboundCampaignBodySchema,
} from "./schemas";
import type {
  CreateOutboundCampaignBody,
  ListQuery,
  OutboundCampaignEntity,
  SetStatusBody,
  UpdateOutboundCampaignBody,
} from "./types";
import type { TokenGetter } from "@/lib/api-token-provider";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:3000";
const COLLECTION = "outbound-campaigns";

async function authFetch(
  getToken: TokenGetter,
  input: RequestInfo,
  init: RequestInit = {}
) {
  const token = await getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers });
}

export async function apiCreateCampaign(
  getToken: TokenGetter,
  body: CreateOutboundCampaignBody
): Promise<OutboundCampaignEntity> {
  const valid = CreateOutboundCampaignBodySchema.parse(body);
  const res = await authFetch(getToken, `${BASE_URL}/${COLLECTION}`, {
    method: "POST",
    body: JSON.stringify(valid),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return OutboundCampaignEntitySchema.parse(json);
}

export async function apiListCampaigns(
  getToken: TokenGetter,
  query: ListQuery
) {
  const q = ListQuerySchema.parse(query);
  const sp = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const res = await authFetch(getToken, `${BASE_URL}/${COLLECTION}?${sp.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return PaginatedSchema(OutboundCampaignEntitySchema).parse(json);
}

export async function apiGetCampaign(
  getToken: TokenGetter,
  id: string,
  agentId?: string
): Promise<OutboundCampaignEntity> {
  const sp = new URLSearchParams();
  if (agentId) sp.set("agentId", agentId);
  const res = await authFetch(getToken, `${BASE_URL}/${COLLECTION}/${id}?${sp.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return OutboundCampaignEntitySchema.parse(json);
}

export async function apiUpdateCampaign(
  getToken: TokenGetter,
  id: string,
  body: UpdateOutboundCampaignBody,
  agentId?: string
): Promise<OutboundCampaignEntity> {
  const valid = UpdateOutboundCampaignBodySchema.parse(body);
  const sp = new URLSearchParams();
  if (agentId) sp.set("agentId", agentId);
  const res = await authFetch(getToken, `${BASE_URL}/${COLLECTION}/${id}?${sp.toString()}`, {
    method: "PATCH",
    body: JSON.stringify(valid),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return OutboundCampaignEntitySchema.parse(json);
}

export async function apiSetCampaignStatus(
  getToken: TokenGetter,
  id: string,
  body: SetStatusBody,
  agentId?: string
): Promise<OutboundCampaignEntity> {
  const valid = SetStatusBodySchema.parse(body);
  const sp = new URLSearchParams();
  if (agentId) sp.set("agentId", agentId);
  const res = await authFetch(getToken, `${BASE_URL}/${COLLECTION}/${id}/status?${sp.toString()}`, {
    method: "PATCH",
    body: JSON.stringify(valid),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return OutboundCampaignEntitySchema.parse(json);
}

export async function apiDeleteCampaign(
  getToken: TokenGetter,
  id: string,
  agentId?: string
): Promise<void> {
  const sp = new URLSearchParams();
  if (agentId) sp.set("agentId", agentId);
  const res = await authFetch(getToken, `${BASE_URL}/${COLLECTION}/${id}?${sp.toString()}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
}
