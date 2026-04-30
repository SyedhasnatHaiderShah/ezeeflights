'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getPaginationRowModel
} from '@tanstack/react-table';
import { AdminShell } from '@/components/admin/admin-shell';
import { adminFetch } from '@/lib/api/admin-api';
import { 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Filter,
  Download,
  Mail,
  Calendar,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({ 
    queryKey: ['admin-users-all'], 
    queryFn: () => adminFetch<User[]>('/users') 
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((u) => 
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const columnHelper = createColumnHelper<User>();

  const columns = [
    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: 'fullName',
      header: 'User Name',
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 uppercase">
            {info.getValue()?.[0] || info.row.original.email[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{info.getValue() || 'N/A'}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" /> {info.row.original.email}
            </span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Shield className={`w-3 h-3 ${info.getValue() === 'ADMIN' ? 'text-brand-red' : 'text-blue-500'}`} />
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            info.getValue() === 'ADMIN' 
              ? 'bg-red-50 text-brand-red' 
              : 'bg-blue-50 text-blue-600'
          }`}>
            {info.getValue() || 'USER'}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Joined Date',
      cell: (info) => (
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Calendar className="w-4 h-4 text-slate-400" />
          {new Date(info.getValue()).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: () => (
        <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Directory</h1>
            <p className="text-slate-500">Manage all users, roles and platform access</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/25">
              <UserPlus className="w-4 h-4" />
              Add New User
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-red/20 text-slate-700 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-slate-50/50">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
                        <span className="text-slate-400 font-bold">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-5 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-20 text-center text-slate-400 font-bold">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-6 border-t border-slate-50 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-500">
              Showing <span className="text-slate-900">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="text-slate-900">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)}</span> of <span className="text-slate-900">{filteredData.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: table.getPageCount() }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      table.getState().pagination.pageIndex === i 
                        ? 'bg-brand-red text-white shadow-lg shadow-red-500/25' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                )).slice(0, 5)}
              </div>
              <button 
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
