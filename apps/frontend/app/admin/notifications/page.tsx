'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { NotificationTable } from '@/components/notifications/NotificationTable';

interface NotificationLog {
  id: string;
  notificationId: string;
  status: string;
  errorMessage: string | null;
  timestamp: string;
}

export default function NotificationsAdminPage() {
  // Auth is handled server-side via HttpOnly cookie — no client-side token needed.
  const logsQuery = useQuery({
    queryKey: ['notification-logs'],
    queryFn: () => apiFetch<NotificationLog[]>('/notifications/logs'),
  });

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">Notification Logs</h1>
      {logsQuery.isLoading && <p>Loading logs...</p>}
      {logsQuery.data && <NotificationTable logs={logsQuery.data} />}
    </section>
  );
}
