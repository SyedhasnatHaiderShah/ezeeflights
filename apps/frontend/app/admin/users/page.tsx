'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { AdminShell } from '@/components/admin/admin-shell';
import { adminFetch } from '@/lib/api/admin-api';

export default function Page() {
  const [search, setSearch] = useState('');
  const q = useQuery({ queryKey: ['admin-users'], queryFn: () => adminFetch<any[]>('/users') });
  const rows = useMemo(() => (q.data ?? []).filter((u) => JSON.stringify(u).toLowerCase().includes(search.toLowerCase())), [q.data, search]);
  const c = createColumnHelper<any>();
  const columns = [c.accessor('email', { header: 'User', cell: (info) => <div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-slate-200" />{info.getValue()}</div> }), c.accessor('roleName', { header: 'Role', cell: (info) => <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{info.getValue() || 'user'}</span> }), c.display({ id: 'actions', header: 'Actions', cell: () => <button className="text-sm text-brand-red">⋯</button> })];
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return <AdminShell><h1 className="mb-4 text-2xl font-bold">Users</h1><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" className="mb-3 rounded border px-3 py-2" /><div className="overflow-auto rounded-xl border bg-white"><table className="min-w-full text-sm"><thead>{table.getHeaderGroups().map((hg) => <tr key={hg.id}>{hg.headers.map((h) => <th key={h.id} className="border-b p-2 text-left">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((r) => <tr key={r.id}>{r.getVisibleCells().map((cell) => <td key={cell.id} className="border-b p-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div></AdminShell>;
}
