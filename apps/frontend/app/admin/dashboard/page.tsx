'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area,
  CartesianGrid 
} from 'recharts';
import { AdminShell } from '@/components/admin/admin-shell';
import { adminFetch } from '@/lib/api/admin-api';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Activity,
  ArrowUpRight,
  Calendar,
  Filter
} from 'lucide-react';

type DashboardData = { 
  kpi: { 
    totalRevenue: string; 
    totalBookings: string; 
    activeUsers: string; 
    conversionRate: string 
  }; 
  charts: {
    revenueTrend: { date: string; value: string }[];
    bookingsTrend: { date: string; value: string }[];
    cancellations: { date: string; value: string }[];
  }
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['admin-dashboard-full'], 
    queryFn: () => adminFetch<DashboardData>('/dashboard') 
  });

  const kpis = [
    { label: 'Total Revenue', value: data?.kpi?.totalRevenue || '$0', trend: '+12.5%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Bookings', value: data?.kpi?.totalBookings || '0', trend: '+8.2%', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Users', value: data?.kpi?.activeUsers || '0', trend: '+14.1%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Conversion Rate', value: `${data?.kpi?.conversionRate || '0'}%`, trend: '+2.4%', icon: Activity, color: 'text-brand-red', bg: 'bg-red-50' },
  ];

  const chartData = data?.charts?.revenueTrend.map(item => ({
    ...item,
    value: parseFloat(item.value)
  })) || [];

  return (
    <AdminShell>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-500">Monitoring platform performance and growth metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all">
              <Calendar className="w-4 h-4" />
              Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all">
              <Filter className="w-4 h-4" />
              Filter Results
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="group p-6 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-lg">
                  {kpi.trend}
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
              <p className="text-slate-500 font-medium text-sm mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-black text-slate-900">
                {isLoading ? '...' : kpi.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Main Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">Revenue Performance</h3>
                <p className="text-slate-500">Daily revenue generated across all booking modules</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-brand-red" />
                  <span className="text-xs font-bold text-slate-500">Direct</span>
                </div>
                <div className="flex items-center gap-1.5 ml-4">
                  <span className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="text-xs font-bold text-slate-500">Partner</span>
                </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={10}
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ef4444" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/20 blur-[80px] -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                        <Users className="w-5 h-5 text-brand-red" />
                      </div>
                      {i !== 4 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-white/10" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">New user registered</p>
                      <p className="text-xs text-slate-400">2 mins ago • user@example.com</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="relative z-10 mt-8 w-full py-4 bg-white text-slate-900 font-black rounded-[1.5rem] hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
              View All Activity
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">Booking Statistics</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-50">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-black">
                  <tr>
                    <th className="px-4 py-3 text-left">Destination</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { dest: 'London, UK', status: 'Confirmed', val: '$1,200', color: 'text-emerald-600' },
                    { dest: 'New York, USA', status: 'Pending', val: '$850', color: 'text-amber-600' },
                    { dest: 'Tokyo, JP', status: 'Cancelled', val: '$2,100', color: 'text-brand-red' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-slate-700">{row.dest}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg bg-slate-50 ${row.color} font-bold text-[10px]`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-black text-slate-900">{row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-brand-red rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 -mr-24 -mt-24 rounded-full group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <Activity className="w-12 h-12 mb-6" />
                <h3 className="text-3xl font-black mb-4 leading-tight">System Health &<br />Monitoring</h3>
                <p className="text-white/80 max-w-xs">All systems operational. No critical issues reported in the last 24 hours.</p>
              </div>
              <div className="flex items-center gap-4 mt-8">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-red bg-white/20 backdrop-blur-sm" />
                  ))}
                </div>
                <p className="text-sm font-bold">5 Admins Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
