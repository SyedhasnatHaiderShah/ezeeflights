'use client';

interface NotificationLog {
  id: string;
  notificationId: string;
  status: string;
  errorMessage: string | null;
  timestamp: string;
}

export function NotificationTable({ logs }: { logs: NotificationLog[] }) {
  return (
    <table className="w-full border-collapse border text-sm">
      <thead>
        <tr className="bg-slate-100 text-left">
          <th className="border p-2">Notification</th>
          <th className="border p-2">Status</th>
          <th className="border p-2">Error</th>
          <th className="border p-2">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id}>
            <td className="border p-2">{log.notificationId}</td>
            <td className="border p-2">{log.status}</td>
            <td className="border p-2">{log.errorMessage ?? '—'}</td>
            <td className="border p-2">{new Date(log.timestamp).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
