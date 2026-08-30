import { isNative } from "../capacitor";
import { nextApiOrigin } from "../bff/config";

const getBaseUrl = () => isNative() ? nextApiOrigin() : "";
const getBase = () => `${getBaseUrl()}/api/admin`;

function readCsrfFromDocumentCookie(): string {
  if (typeof document === "undefined") {
    return "";
  }
  const m = document.cookie.match(/(?:^|; )ezee_csrf=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : "";
}

function csrfHeaders(method: string): Record<string, string> {
  const m = method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(m)) {
    return {};
  }
  const token = readCsrfFromDocumentCookie();
  return token ? { "X-CSRF-Token": token } : {};
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_access_token");
}

function toQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const q = query.toString();
  return q ? `?${q}` : "";
}

export async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const res = await fetch(`${getBase()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(method),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok)
    throw new Error((await res.text()) || `Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const getRevenueOverview = (query: { from?: string; to?: string }) =>
  adminFetch(`/revenue/overview${toQuery(query)}`);
export const getRevenueByModule = (query: { from?: string; to?: string }) =>
  adminFetch<Array<{ module: string; revenue: number; bookings: number }>>(
    `/revenue/by-module${toQuery(query)}`,
  );
export const getOperationsStatus = (query: { from?: string; to?: string }) =>
  adminFetch(`/operations/status${toQuery(query)}`);
export const getOperationsSla = (query: { from?: string; to?: string }) =>
  adminFetch<Array<{ bookingId: string; status: string }>>(
    `/operations/sla${toQuery(query)}`,
  );
export const getFinanceSettlements = () =>
  adminFetch<
    Array<{
      id: string;
      provider: string;
      totalAmount: number;
      settledAmount: number;
      pendingAmount: number;
    }>
  >("/finance/settlements");
export const getFinanceReconciliation = () =>
  adminFetch<Array<{ id: string; transactionId: string; status: string }>>(
    "/finance/reconciliation",
  );
export const getMonitoringLive = () => adminFetch("/monitoring/live");
export const getMonitoringHealth = () => adminFetch("/monitoring/health");
export const getInsightsTopDestinations = (query: {
  from?: string;
  to?: string;
}) => adminFetch(`/insights/top-destinations${toQuery(query)}`);
export const getInsightsTrends = (query: {
  from?: string;
  to?: string;
  granularity?: string;
}) => adminFetch(`/insights/trends${toQuery(query)}`);
export type AdminPromotionKind = "PERCENT" | "FIXED";
export type AdminPromotion = {
  code: string;
  title: string;
  description?: string;
  kind: AdminPromotionKind;
  value: number;
  active?: boolean;
  startsAt?: string;
  endsAt?: string;
  minSubtotal?: number;
  minTravelers?: number;
  firstBookingOnly?: boolean;
  memberOnly?: boolean;
  partnerCode?: string;
  campaignTag?: string;
  autoApply?: boolean;
  flashSale?: boolean;
  maxDiscount?: number;
  usageLimit?: number;
  redeemedCount?: number;
};

export const listAdminCoupons = () =>
  adminFetch<AdminPromotion[]>("/promotions/coupons");
export const saveAdminCoupon = (payload: AdminPromotion) =>
  adminFetch<AdminPromotion>("/promotions/coupons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const deleteAdminCoupon = (code: string) =>
  adminFetch<void>(`/promotions/coupons/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
export const listAdminCampaigns = () =>
  adminFetch<AdminPromotion[]>("/promotions/campaigns");
export const saveAdminCampaign = (payload: AdminPromotion) =>
  adminFetch<AdminPromotion>("/promotions/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const deleteAdminCampaign = (code: string) =>
  adminFetch<void>(`/promotions/campaigns/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
export const getExecutiveOverview = async () => {
  const [revenue, operations, settlements] = await Promise.all([
    getRevenueOverview({}),
    getOperationsStatus({}),
    getFinanceSettlements(),
  ]);

  return { revenue, operations, settlements };
};

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  createdAt: string;
}

export const listUsers = (limit?: number, page?: number, search?: string) => {
  const query = new URLSearchParams();
  if (limit !== undefined) query.set("limit", limit.toString());
  if (page !== undefined) query.set("page", page.toString());
  if (search !== undefined && search !== "") query.set("search", search);
  return adminFetch<AdminUser[]>(`/users${query.toString() ? `?${query.toString()}` : ""}`);
};
export const createUser = (
  payload: Partial<AdminUser> & { password?: string },
) =>
  adminFetch<AdminUser>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateUser = (id: string, payload: Partial<AdminUser>) =>
  adminFetch<AdminUser>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const deleteUser = (id: string) =>
  adminFetch<{ id: string; deleted: boolean }>(`/users/${id}`, {
    method: "DELETE",
  });

export interface AdminPackage {
  id: string;
  title: string;
  slug: string;
  description: string;
  destination: string;
  country: string;
  durationDays: number;
  basePrice: number;
  currency: string;
  thumbnailUrl: string | null;
  originCity: string | null;
  airlineName: string | null;
  isFlashSale: boolean;
  expiresAt: string | null;
  type: "package" | "flight_deal";
  status: "draft" | "published" | "archived";
  pricing?: { adultPrice: number; childPrice: number; infantPrice: number };
  inclusions?: Array<{ type: string; description: string }>;
  exclusions?: string[];
}

export const listAdminPackages = (query: {
  page?: number;
  limit?: number;
  status?: string;
  destination?: string;
}) =>
  adminFetch<{ data: AdminPackage[]; total: number }>(
    `/packages${toQuery(query as any)}`,
  );

export const createAdminPackage = (payload: Partial<AdminPackage>) =>
  adminFetch<AdminPackage>("/packages", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAdminPackage = (
  id: string,
  payload: Partial<AdminPackage>,
) =>
  adminFetch<AdminPackage>(`/packages/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteAdminPackage = (id: string) =>
  adminFetch<{ success: boolean }>(`/packages/${id}`, {
    method: "DELETE",
  });

export const listAdminFlightDeals = (query: {
  page?: number;
  limit?: number;
  status?: string;
  destination?: string;
}) =>
  adminFetch<{ data: AdminPackage[]; total: number }>(
    `/flight-deals${toQuery(query as any)}`,
  );

export const createAdminFlightDeal = (payload: Partial<AdminPackage>) =>
  adminFetch<AdminPackage>("/flight-deals", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAdminFlightDeal = (
  id: string,
  payload: Partial<AdminPackage>,
) =>
  adminFetch<AdminPackage>(`/flight-deals/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteAdminFlightDeal = (id: string) =>
  adminFetch<{ success: boolean }>(`/flight-deals/${id}`, {
    method: "DELETE",
  });

export interface AdminFlightAd {
  id: string;
  flightId: string;
  partnerCode: string;
  partnerName: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  airline: string;
  flightNumber: string;
  displayPrice: number;
  originalPrice: number;
  discountPct: number;
  currency: string;
  createdAt: string;
}

export const listFlightAds = () => adminFetch<AdminFlightAd[]>("/flights/ads");
export const updateFlightAd = (id: string, payload: { displayPrice: number; discountPct: number }) =>
  adminFetch<{ success: boolean; displayPrice: number; discountPct: number }>(`/flights/ads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const adminGetCrmUsers = (limit: number = 10) =>
  adminFetch<any[]>(`/crm-users?limit=${limit}`);

export const adminGetCrmBookings = (limit: number = 10) =>
  adminFetch<any[]>(`/crm-bookings?limit=${limit}`);

// ─── Spanish Jetcost (usa_table) ────────────────────────────────────────────

export interface UsaMarkupRow {
  Id: number;
  source: string;
  destination: string;
  airline: string;
  startDate: string;
  endDate: string;
  markupType: 'percentage' | 'fixed' | 'replace';
  cabinClass: string;
  journeyType: string;
  adultAmount: number;
  childAmount: number;
  infantAmount: number;
  userId: string | null;
  userName: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UsaMarkupListResponse {
  data: UsaMarkupRow[];
  total: number;
}

export type CreateUsaMarkupDto = Omit<UsaMarkupRow, 'Id' | 'created_at' | 'updated_at'>;
export type UpdateUsaMarkupDto = Partial<CreateUsaMarkupDto>;

export const getUsaMarkupStatus = () =>
  adminFetch<{ status: string }>('/usa-markup/status');

export const updateUsaMarkupStatus = (status: string) =>
  adminFetch<{ success: boolean; status: string }>('/usa-markup/status', {
    method: 'POST',
    body: JSON.stringify({ status }),
  });

export const listUsaMarkup = (page = 1, limit = 10) =>
  adminFetch<UsaMarkupListResponse>(`/usa-markup?page=${page}&limit=${limit}`);

export const createUsaMarkup = (body: CreateUsaMarkupDto) =>
  adminFetch<UsaMarkupRow>('/usa-markup', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateUsaMarkup = (id: number, body: UpdateUsaMarkupDto) =>
  adminFetch<UsaMarkupRow>(`/usa-markup/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const deleteUsaMarkup = (id: number) =>
  adminFetch<{ success: boolean; id: number }>(`/usa-markup/${id}`, {
    method: 'DELETE',
  });

// ─── Hold Destinations (tbl_hold_des_ezee) ──────────────────────────────────

export interface HoldDestinationRow {
  hold_des_id: number;
  hold_destination: string | null;
}

export const listHoldDestinations = () =>
  adminFetch<HoldDestinationRow[]>('/hold-destinations');

export const createHoldDestination = (hold_destination: string) =>
  adminFetch<HoldDestinationRow>('/hold-destinations', {
    method: 'POST',
    body: JSON.stringify({ hold_destination }),
  });

export const deleteHoldDestination = (id: number) =>
  adminFetch<{ success: boolean; id: number }>(`/hold-destinations/${id}`, {
    method: 'DELETE',
  });

// ─── Hold Origins (tbl_hold_org_ezee) ───────────────────────────────────────

export interface HoldOriginRow {
  hold_org_id: number;
  hold_orgin: string | null;
}

export const listHoldOrigins = () =>
  adminFetch<HoldOriginRow[]>('/hold-origins');

export const createHoldOrigin = (hold_orgin: string) =>
  adminFetch<HoldOriginRow>('/hold-origins', {
    method: 'POST',
    body: JSON.stringify({ hold_orgin }),
  });

export const deleteHoldOrigin = (id: number) =>
  adminFetch<{ success: boolean; id: number }>(`/hold-origins/${id}`, {
    method: 'DELETE',
  });

// ─── Click Details (click_detail) ───────────────────────────────────────────

export interface ClickDetailRow {
  Id: string;
  log: string;
  CreatedOn: string;
  Ip: string | null;
  sitesource?: string | null;
}

export interface ClickDetailListResponse {
  data: ClickDetailRow[];
  total: number;
}

export const listClickDetails = (page = 1, limit = 20) =>
  adminFetch<ClickDetailListResponse>(
    `/click-details?page=${page}&limit=${limit}`,
  );

export const getClickDetailById = (id: string) =>
  adminFetch<ClickDetailRow | null>(
    `/click-details/${encodeURIComponent(id)}`,
  );

export const deleteClickDetail = (id: string) =>
  adminFetch<{ success: boolean; id: string }>(
    `/click-details/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );

// ─── Worldrix CRM (generic config-driven CRUD over worldrix_ezeecrm) ─────────

export interface WorldrixTableMeta {
  resource: string;
  label: string;
  pk: string;
  pkAuto: boolean;
  columns: string[];
  writable: string[];
}

export type WorldrixRow = Record<string, unknown>;

export interface WorldrixListResponse {
  data: WorldrixRow[];
  total: number;
}

export const getWorldrixMeta = () =>
  adminFetch<WorldrixTableMeta[]>('/worldrix/meta');

export const listWorldrix = (resource: string, page = 1, limit = 20) =>
  adminFetch<WorldrixListResponse>(
    `/worldrix/${resource}?page=${page}&limit=${limit}`,
  );

export const createWorldrix = (resource: string, body: WorldrixRow) =>
  adminFetch<WorldrixRow>(`/worldrix/${resource}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateWorldrix = (
  resource: string,
  id: string | number,
  body: WorldrixRow,
) =>
  adminFetch<WorldrixRow>(
    `/worldrix/${resource}/${encodeURIComponent(String(id))}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );

export const deleteWorldrix = (resource: string, id: string | number) =>
  adminFetch<{ success: boolean; id: string }>(
    `/worldrix/${resource}/${encodeURIComponent(String(id))}`,
    { method: 'DELETE' },
  );

// ─── Cheap Bid (tbl_cheap_bid_offer) ────────────────────────────────────────

export interface CheapBidSegmentDto {
  direction: "outbound" | "inbound";
  legOrder: number;
  stopTime?: string;
  airlineCode?: string;
  airlineNameNumber?: string;
  depart?: string;
  arrive?: string;
  departDateTime?: string;
  arriveDateTime?: string;
  totalTime?: string;
}

export interface CheapBidOfferRow {
  id: number;
  source?: string;
  originFrom: string;
  destinationTo: string;
  airLine?: string;
  travellType?: string;
  cabin?: string;
  departureDate: string;
  returnDate?: string;
  bidAdtPrice?: number | null;
  bidChdPrice?: number | null;
  bidInfPrice?: number | null;
  originalAdtPrice?: number;
  originalChdPrice?: number;
  originalInfPrice?: number;
  currency?: string;
  discountType?: string;
  linkExpiryDate: string;
  status: string;
  flightId?: string;
  stops?: number | null;
  segments?: CheapBidSegmentDto[];
  created_at?: string;
  updated_at?: string;
}

export type CreateCheapBidDto = Omit<
  CheapBidOfferRow,
  "id" | "status" | "created_at" | "updated_at"
> & {
  coarseMatch?: boolean;
};
export type UpdateCheapBidDto = Partial<CreateCheapBidDto> & { status?: string };

export interface CheapBidListResponse {
  data: CheapBidOfferRow[];
  total: number;
  page?: number;
  limit?: number;
}

export const listCheapBids = (page = 1, limit = 10) =>
  adminFetch<CheapBidListResponse>(`/cheap-bid?page=${page}&limit=${limit}`);

export const getCheapBid = (id: number) =>
  adminFetch<CheapBidOfferRow>(`/cheap-bid/${id}`);

export const createCheapBid = (body: CreateCheapBidDto) =>
  adminFetch<CheapBidOfferRow>("/cheap-bid", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateCheapBid = (id: number, body: UpdateCheapBidDto) =>
  adminFetch<CheapBidOfferRow>(`/cheap-bid/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteCheapBid = (id: number) =>
  adminFetch<{ success: boolean; id: number }>(`/cheap-bid/${id}`, {
    method: "DELETE",
  });

export const deleteAllCheapBids = () =>
  adminFetch<{ success: boolean; deleted: number }>(`/cheap-bid`, {
    method: "DELETE",
  });

export const deleteBulkCheapBids = (ids: number[]) =>
  adminFetch<{ success: boolean; deleted: number }>(`/cheap-bid/bulk-delete`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  });


export const getCheapBidStatus = () =>
  adminFetch<{ status: string }>('/cheap-bid/status');

export const updateCheapBidStatus = (status: string) =>
  adminFetch<{ success: boolean; status: string }>('/cheap-bid/status', {
    method: 'POST',
    body: JSON.stringify({ status }),
  });

export const clearCheapBidCache = () =>
  adminFetch<{ success: boolean; message: string }>('/cheap-bid/clear-cache', {
    method: 'POST',
  });

export async function uploadCheapBids(file: File): Promise<{
  success: boolean;
  count: number;
  skippedCount: number;
  errors?: string[];
  message: string;
}> {
  const form = new FormData();
  form.append('file', file);
  
  const token = localStorage.getItem("admin_access_token");
  const headers: Record<string, string> = {
    ...csrfHeaders('POST'),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${getBase()}/cheap-bid/upload`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: form,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

// ─── Customer Flight Details (tbl_flightdetailshtml) ───────────────────────

export interface ParsedFlightSegment {
  logo?: string;
  flightNo?: string;
  airline?: string;
  depTime?: string;
  depDetails?: string;
  arrTime?: string;
  arrDetails?: string;
  cabin?: string;
  isStopover?: boolean;
  stopoverText?: string;
}

export interface ParsedFlightDirection {
  title: string;
  origin: string;
  destination: string;
  date: string;
  segments: ParsedFlightSegment[];
}

export interface CustomerFlightDetails {
  found: boolean;
  id?: number;
  customerId: number | string;
  outbound: ParsedFlightDirection | null;
  inbound: ParsedFlightDirection | null;
  rawOutboundHtml: string;
  rawInboundHtml: string;
}

export const getCustomerFlightDetails = (customerId: string) =>
  adminFetch<CustomerFlightDetails>(
    `/worldrix/flight-details/${encodeURIComponent(customerId)}`,
  );

export interface CompleteBookingInspectorResult {
  found: boolean;
  bookingRef?: string;
  customerId?: string | number;
  customerDetails?: Record<string, any> | null;
  customers?: Record<string, any>[];
  refundShield?: Record<string, any> | null;
  refundShieldCnfrm?: Record<string, any> | null;
  affirmBookingForms?: Record<string, any>[];
  affirmPayments?: Record<string, any>[];
  flightDetailsHtml?: Record<string, any> | null;
  parsedItinerary?: {
    outbound: ParsedFlightDirection | null;
    inbound: ParsedFlightDirection | null;
    rawOutboundHtml: string;
    rawInboundHtml: string;
  };
}

export const getCompleteBookingInspector = (query: {
  bookingRef?: string;
  customerId?: string;
}) =>
  adminFetch<CompleteBookingInspectorResult>(
    `/worldrix/booking-inspector${toQuery(query)}`,
  );

