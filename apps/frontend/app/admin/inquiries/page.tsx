"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  adminGetInquiries,
  adminGetInquiryStats,
  adminUpdateInquiry,
  type FlightInquiry,
  type InquiryStats,
} from "@/lib/api/inquiries";
import { format } from "date-fns";
import {
  X,
  Plane,
  Users,
  Clock,
  CheckCircle2,
  PhoneCall,
  XCircle,
  Search,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    dot: "bg-amber-500",
  },
  REVIEWED: {
    label: "Reviewed",
    icon: CheckCircle2,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    dot: "bg-blue-500",
  },
  CONTACTED: {
    label: "Contacted",
    icon: PhoneCall,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    dot: "bg-green-500",
  },
  CLOSED: {
    label: "Closed",
    icon: XCircle,
    color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    dot: "bg-slate-400",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold",
        cfg.color,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function StatsCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-md shadow-slate-100/60">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2.5 rounded-xl", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export default function AdminInquiriesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FlightInquiry | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["admin-inquiries", statusFilter],
    queryFn: () => adminGetInquiries(statusFilter || undefined),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-inquiry-stats"],
    queryFn: adminGetInquiryStats,
  });

  const filtered = inquiries.filter((inq) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inq.id.toLowerCase().includes(q) ||
      (inq.origin ?? "").toLowerCase().includes(q) ||
      (inq.destination ?? "").toLowerCase().includes(q) ||
      (inq.userEmail ?? "").toLowerCase().includes(q) ||
      (inq.userFirstName ?? "").toLowerCase().includes(q) ||
      (inq.userLastName ?? "").toLowerCase().includes(q)
    );
  });

  function openDetail(inq: FlightInquiry) {
    setSelected(inq);
    setEditStatus(inq.status);
    setEditNotes(inq.adminNotes ?? "");
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await adminUpdateInquiry(selected.id, {
        status: editStatus,
        adminNotes: editNotes,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-inquiry-stats"],
      });
      setSelected(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto space-y-8 py-8">
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Flight <span className="text-brand-red">Inquiries</span>
            </h1>
            <p className="text-slate-500 mt-1">
              Review and manage booking inquiries from users.
            </p>
          </div>
        </div>

        {/* ─── Stats Cards ──────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatsCard
              label="Total"
              value={stats.total}
              color="bg-slate-700"
              icon={Plane}
            />
            <StatsCard
              label="Pending"
              value={stats.pending}
              color="bg-amber-500"
              icon={Clock}
            />
            <StatsCard
              label="Reviewed"
              value={stats.reviewed}
              color="bg-blue-500"
              icon={CheckCircle2}
            />
            <StatsCard
              label="Contacted"
              value={stats.contacted}
              color="bg-green-500"
              icon={PhoneCall}
            />
            <StatsCard
              label="Closed"
              value={stats.closed}
              color="bg-slate-400"
              icon={XCircle}
            />
          </div>
        )}

        {/* ─── Filters ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, route, email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="h-11 w-full sm:w-44 rounded-xl border border-input bg-background px-4 pr-9 text-sm outline-none transition-all focus:border-primary/50 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* ─── Table ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-medium">
              Loading inquiries...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Plane className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">No inquiries found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wide">
                      Reference
                    </th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wide">
                      User
                    </th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wide">
                      Route
                    </th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wide">
                      Travelers
                    </th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wide">
                      Submitted
                    </th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inq) => {
                    const ref = `INQ-${inq.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
                    const travelerCount = Array.isArray(inq.travelers)
                      ? inq.travelers.length
                      : 0;
                    return (
                      <tr
                        key={inq.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => openDetail(inq)}
                      >
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-slate-700 text-xs">
                            {ref}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {[inq.userFirstName, inq.userLastName]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {inq.userEmail || "—"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span>{inq.origin || "—"}</span>
                            <Plane className="h-3.5 w-3.5 text-slate-400" />
                            <span>{inq.destination || "—"}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {inq.departDate || "—"} •{" "}
                            {inq.cabinClass || "Economy"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-semibold">
                              {travelerCount}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {inq.adults}A{" "}
                            {inq.children > 0 ? `${inq.children}C ` : ""}
                            {inq.infants > 0 ? `${inq.infants}I` : ""}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs">
                          {inq.createdAt
                            ? format(
                                new Date(inq.createdAt),
                                "MMM d, yyyy HH:mm",
                              )
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={inq.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(inq);
                            }}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Detail Drawer ────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          {/* Panel */}
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-black text-lg text-slate-900">
                  Inquiry Detail
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  INQ-{selected.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {/* User */}
              <div className="rounded-xl border border-slate-100 p-4 space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  User
                </p>
                <p className="font-bold text-slate-800">
                  {[selected.userFirstName, selected.userLastName]
                    .filter(Boolean)
                    .join(" ") || "Anonymous"}
                </p>
                <p className="text-sm text-slate-500">
                  {selected.userEmail || "—"}
                </p>
              </div>

              {/* Flight Info */}
              <div className="rounded-xl border border-slate-100 p-4 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Flight
                </p>
                <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
                  <span>{selected.origin || "—"}</span>
                  <Plane className="h-5 w-5 text-slate-400" />
                  <span>{selected.destination || "—"}</span>
                </div>
                <p className="text-sm text-slate-500">
                  {selected.departDate || "—"} •{" "}
                  {selected.cabinClass || "Economy"} •{" "}
                  {selected.tripType || "One Way"}
                </p>
                <p className="text-sm text-slate-500">
                  Adults: {selected.adults} | Children: {selected.children} |
                  Infants: {selected.infants}
                </p>
                <p className="text-xs font-mono text-slate-400">
                  Flight ID: {selected.flightId}
                </p>
              </div>

              {/* Travelers */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Travelers (
                  {Array.isArray(selected.travelers)
                    ? selected.travelers.length
                    : 0}
                  )
                </p>
                <div className="space-y-3">
                  {(Array.isArray(selected.travelers)
                    ? selected.travelers
                    : []
                  ).map((t: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-brand-red/10 text-brand-red font-black text-xs flex items-center justify-center">
                          {i + 1}
                        </div>
                        <p className="font-bold text-slate-800 text-sm">
                          {[t.firstName, t.middleName, t.lastName]
                            .filter(Boolean)
                            .join(" ")}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                        <span>
                          DOB: <strong>{t.dob || "—"}</strong>
                        </span>
                        <span>
                          Nationality: <strong>{t.nationality || "—"}</strong>
                        </span>
                        <span>
                          Gender: <strong>{t.gender || "—"}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Controls */}
              <div className="rounded-xl border border-slate-100 p-4 space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Admin Actions
                </p>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">
                    Status
                  </Label>
                  <select
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-red/50 transition-all"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">
                    Admin Notes
                  </Label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-red/50 transition-all resize-none"
                    placeholder="Add internal notes here..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Submitted at */}
              <p className="text-xs text-slate-400">
                Submitted:{" "}
                {selected.createdAt
                  ? format(
                      new Date(selected.createdAt),
                      "MMMM d, yyyy 'at' HH:mm",
                    )
                  : "—"}
              </p>
            </div>

            {/* Footer actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setSelected(null)}
              >
                Cancel
              </Button>
              <Button
                disabled={saving}
                className="flex-1 rounded-xl bg-brand-red text-white font-bold hover:bg-red-600"
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
