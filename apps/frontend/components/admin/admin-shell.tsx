'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { adminFetch, getAdminToken } from '@/lib/api/admin-api';

const menu = [
  { href: '/admin/dashboard', label: 'Dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'MARKETING'] },
  { href: '/admin/users', label: 'Users', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/bookings', label: 'Bookings', roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { href: '/admin/payments', label: 'Payments', roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] },
  { href: '/admin/analytics', label: 'Analytics', roles: ['SUPER_ADMIN', 'ADMIN', 'MARKETING'] },
  { href: '/admin/settings', label: 'Settings', roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] },
  { href: '/admin/logs', label: 'Logs', roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    adminFetch<{ roleName: string }>('/me').then((me) => setRole(me.roleName)).catch(() => {
      localStorage.removeItem('admin_access_token');
      router.replace('/admin/login');
    });
  }, [router]);

  const items = useMemo(() => menu.filter((i) => i.roles.includes(role)), [role]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4 bg-slate-50">
        <h2 className="font-bold mb-4">Admin Control Center</h2>
        <nav className="space-y-2">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={`block rounded px-2 py-1 ${pathname === item.href ? 'bg-slate-200 font-semibold' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
