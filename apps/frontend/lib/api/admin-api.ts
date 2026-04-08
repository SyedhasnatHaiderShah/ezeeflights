const BASE = '/api/v1/admin';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

function toQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const q = query.toString();
  return q ? `?${q}` : '';
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(await res.text() || `Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const getRevenueOverview = (query: { from?: string; to?: string }) => adminFetch(`/revenue/overview${toQuery(query)}`);
export const getRevenueByModule = (query: { from?: string; to?: string }) => adminFetch<Array<{ module: string; revenue: number; bookings: number }>>(`/revenue/by-module${toQuery(query)}`);
export const getOperationsStatus = (query: { from?: string; to?: string }) => adminFetch(`/operations/status${toQuery(query)}`);
export const getOperationsSla = (query: { from?: string; to?: string }) => adminFetch<Array<{ bookingId: string; status: string }>>(`/operations/sla${toQuery(query)}`);
export const getFinanceSettlements = () => adminFetch<Array<{ id: string; provider: string; totalAmount: number; settledAmount: number; pendingAmount: number }>>('/finance/settlements');
export const getFinanceReconciliation = () => adminFetch<Array<{ id: string; transactionId: string; status: string }>>('/finance/reconciliation');
export const getMonitoringLive = () => adminFetch('/monitoring/live');
export const getMonitoringHealth = () => adminFetch('/monitoring/health');
export const getInsightsTopDestinations = (query: { from?: string; to?: string }) => adminFetch(`/insights/top-destinations${toQuery(query)}`);
export const getInsightsTrends = (query: { from?: string; to?: string; granularity?: string }) => adminFetch(`/insights/trends${toQuery(query)}`);
export const getExecutiveOverview = async () => {
  const [revenue, operations, settlements] = await Promise.all([
    getRevenueOverview({}),
    getOperationsStatus({}),
    getFinanceSettlements(),
  ]);

  return { revenue, operations, settlements };
};
