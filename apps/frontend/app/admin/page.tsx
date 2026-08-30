"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminFetch } from "@/lib/api/admin-api";
import Link from "next/link";
import type { Route } from "next";
import {
  Users,
  LayoutDashboard,
  CreditCard,
  Settings,
  ShieldCheck,
  BarChart3,
  ExternalLink,
  ArrowRight,
  Inbox,
  Plane,
} from "lucide-react";

import { SUPPORTED_CURRENCIES } from "@/lib/store/currency-store";

type DashboardData = {
  kpi: {
    totalRevenue: string;
    totalBookings: string;
    totalUsers: string;
  };
};

function formatUsd(value?: string): string {
  const amount = Number(value) || 0;
  const rounded = Math.round(amount * 100) / 100;
  return `${SUPPORTED_CURRENCIES.USD.symbol} ${rounded.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export default function AdminGatewayPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: () => adminFetch<DashboardData>("/dashboard"),
  });

  const quickStats = [
    {
      label: "Total Revenue",
      value: formatUsd(data?.kpi?.totalRevenue),
      icon: CreditCard,
      color: "bg-emerald-500",
    },
    {
      label: "Active Users",
      value: data?.kpi?.totalUsers || "0",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Total Bookings",
      value: data?.kpi?.totalBookings || "0",
      icon: LayoutDashboard,
      color: "bg-amber-500",
    },
  ];

  const adminModules = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      description: "Real-time analytics and performance metrics",
      icon: LayoutDashboard,
    },
    {
      name: "User Management",
      href: "/admin/users",
      description: "Manage accounts, roles, and permissions",
      icon: Users,
    },
    {
      name: "Financials",
      href: "/admin/payments",
      description: "Transaction history and revenue reports",
      icon: CreditCard,
    },
    {
      name: "System Settings",
      href: "/admin/settings",
      description: "Platform configuration and defaults",
      icon: Settings,
    },
    {
      name: "Security & Logs",
      href: "/admin/logs",
      description: "Audit trails and access monitoring",
      icon: ShieldCheck,
    },
    {
      name: "Flight Inquiries",
      href: "/admin/inquiries",
      description: "Review and manage booking inquiries from users",
      icon: Inbox,
    },
    {
      name: "Flight Ads",
      href: "/admin/flights/ads",
      description: "Manage metasearch partner ads and pricing",
      icon: Plane,
    },
  ];

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto space-y-10 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Admin <span className="text-brand-red">Control Center</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Welcome back. Here's a quick overview of your platform's
              performance today.
            </p>
          </div>
          <Link
            href={"/" as Route}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Go to User Site
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="relative group overflow-hidden rounded-3xl bg-white border border-slate-100 p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500 ${stat.color}`}
              />
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg shadow-${stat.color.split("-")[1]}-200`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 font-medium text-sm">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {isLoading ? "..." : stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modules Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Management Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((module) => (
              <Link
                key={module.name}
                href={module.href as Route}
                className="group flex flex-col p-6 bg-white border border-slate-100 rounded-3xl shadow-lg shadow-slate-200/40 hover:border-brand-red/20 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-brand-red/5 transition-colors">
                    <module.icon className="w-6 h-6 text-slate-600 group-hover:text-brand-red transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand-red transition-colors">
                    {module.name}
                  </h3>
                </div>
                <p className="text-slate-500 text-sm mb-6 flex-1">
                  {module.description}
                </p>
                <div className="flex items-center gap-2 text-brand-red font-bold text-sm">
                  Access Module
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="rounded-[40px] bg-slate-900 p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-brand-red/20 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black mb-4">
              Need help managing the platform?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Check out the documentation or contact system support for
              technical assistance regarding roles and permissions.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-3 bg-brand-red text-white font-bold rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25">
                System Support
              </button>
              <button className="px-8 py-3 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors backdrop-blur-md">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
