'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { adminFetch, getAdminToken } from '@/lib/api/admin-api';

const groupedMenu = {
  OVERVIEW: [{ href: '/admin/dashboard', label: 'Dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'MARKETING'] }],
  OPERATIONS: [{ href: '/admin/bookings', label: 'Bookings', roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] }, { href: '/admin/operations', label: 'Operations', roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT'] }],
  MANAGEMENT: [{ href: '/admin/users', label: 'Users', roles: ['SUPER_ADMIN', 'ADMIN'] }, { href: '/admin/payments', label: 'Payments', roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] }, { href: '/admin/promotions', label: 'Promotions', roles: ['SUPER_ADMIN', 'ADMIN', 'MARKETING'] }],
  SYSTEM: [{ href: '/admin/settings', label: 'Settings', roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] }, { href: '/admin/logs', label: 'Logs', roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] }],
} as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { const token = getAdminToken(); if (!token) { router.replace('/admin/login'); return; } adminFetch<{ roleName: string }>('/me').then((me) => setRole(me.roleName)).catch(() => { localStorage.removeItem('admin_access_token'); router.replace('/admin/login'); }); }, [router]);

  const sections = useMemo(() => Object.entries(groupedMenu).map(([k, items]) => [k, items.filter((i) => i.roles.includes(role as any))] as const), [role]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-[#072f66] p-4 text-white transition-all`}>
        <button onClick={() => setCollapsed((v) => !v)} className="mb-4 rounded border border-white/30 px-2 py-1 text-xs">{collapsed ? '>>' : 'Collapse'}</button>
        {sections.map(([group, items]) => (
          <div key={group} className="mb-5">
            {!collapsed && <h3 className="mb-2 text-xs font-bold tracking-widest text-white/60">{group}</h3>}
            <nav className="space-y-1">{items.map((item) => <Link key={item.href} href={item.href as Route} className={`block rounded px-2 py-2 text-sm ${pathname === item.href ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}`}>{collapsed ? item.label[0] : item.label}</Link>)}</nav>
          </div>
        ))}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
