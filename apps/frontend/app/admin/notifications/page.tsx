'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth-store';
import { NotificationTable } from '@/components/notifications/NotificationTable';

interface NotificationLog {
  id: string;
  notificationId: string;
  status: string;
  errorMessage: string | null;
  timestamp: string;
}

export default function NotificationsAdminPage() {
  const token = useAuthStore((state) => state.accessToken);

  const logsQuery = useQuery({
    queryKey: ['notification-logs', token],
    queryFn: () =>
      apiFetch<NotificationLog[]>('/notifications/logs', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: Boolean(token),
  });

  if (!token) {
    return <p className="rounded border bg-amber-50 p-3">Admin token required.</p>;
  }

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">Notification Logs</h1>
      {logsQuery.isLoading && <p>Loading logs...</p>}
      {logsQuery.data && <NotificationTable logs={logsQuery.data} />}
    </section>
  );
}
