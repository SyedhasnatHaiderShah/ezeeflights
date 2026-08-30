"use client";

import React, { useState } from "react";
import { Header } from "@/components/sections/Header";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LogEntry {
  ts: string;
  level: "info" | "success" | "warn" | "error";
  msg: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nowStr() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

const LEVEL_COLORS: Record<LogEntry["level"], string> = {
  info: "text-sky-400",
  success: "text-emerald-400",
  warn: "text-amber-400",
  error: "text-red-400",
};

const LEVEL_BADGES: Record<LogEntry["level"], string> = {
  info: "bg-sky-900/60 text-sky-300 border border-sky-700",
  success: "bg-emerald-900/60 text-emerald-300 border border-emerald-700",
  warn: "bg-amber-900/60 text-amber-300 border border-amber-700",
  error: "bg-red-900/60 text-red-300 border border-red-700",
};

// ─── Default form values (mirrors the C# model) ───────────────────────────────
const DEFAULTS = {
  Org: "JFK",
  Des: "LHR",
  DDate: "2026-08-15",
  RDate: "",
  Adt: "1",
  Chld: "0",
  Inf: "0",
  Cabin: "Economy",
  DirectFlightsOnly: false,
  Ref: "AGENT001",
  TCode: "TC123",
  utm_source: "JetCost",
  utm_medium: "cpc",
  utm_campaign: "flight-search",
  email: "test@example.com",
  phoneNo: "+12125551234",
};

export default function FakeJetcostPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  function log(level: LogEntry["level"], msg: string) {
    setLogs((prev) => [...prev, { ts: nowStr(), level, msg }]);
  }

  // ── Build the URL exactly as JetCost would send it ────────────────────────
  function buildUrl() {
    const apiBase =
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
        .replace(":3000", ":4000");

    const params = new URLSearchParams();
    params.set("Org", form.Org.toUpperCase());
    params.set("Des", form.Des.toUpperCase());
    params.set("DDate", form.DDate);
    if (form.RDate) params.set("RDate", form.RDate);
    params.set("Adt", form.Adt);
    params.set("Chld", form.Chld);
    params.set("Inf", form.Inf);
    params.set("Cabin", form.Cabin);
    params.set("DirectFlightsOnly", form.DirectFlightsOnly ? "true" : "false");
    if (form.Ref) params.set("Ref", form.Ref);
    if (form.TCode) params.set("TCode", form.TCode);
    if (form.utm_source) params.set("utm_source", form.utm_source);
    if (form.utm_medium) params.set("utm_medium", form.utm_medium);
    if (form.utm_campaign) params.set("utm_campaign", form.utm_campaign);
    if (form.email) params.set("email", form.email);
    if (form.phoneNo) params.set("phoneNo", form.phoneNo);

    return `${apiBase}/api/flights/search?${params.toString()}`;
  }

  // ── Run search ────────────────────────────────────────────────────────────
  async function handleSearch() {
    setLogs([]);
    setResult(null);
    setLoading(true);

    const url = buildUrl();

    // Mimic backend log output
    setLogs([
      { ts: nowStr(), level: "info", msg: "━━━━━ JetCost Search Simulator ━━━━━" },
      { ts: nowStr(), level: "info", msg: `[Jetcost] Incoming: ${form.Org.toUpperCase()}→${form.Des.toUpperCase()} ${form.DDate}${form.RDate ? "/" + form.RDate : ""} | Pax: A${form.Adt} C${form.Chld} I${form.Inf} | Cabin: ${form.Cabin} | Direct: ${form.DirectFlightsOnly}` },
      { ts: nowStr(), level: "info", msg: `Ref: "${form.Ref}" | TCode: "${form.TCode}" | email: "${form.email}" | phone: "${form.phoneNo}"` },
      { ts: nowStr(), level: "info", msg: `utm: ${form.utm_source}/${form.utm_medium}/${form.utm_campaign}` },
      { ts: nowStr(), level: "info", msg: "──────────────────────────────────────" },
      { ts: nowStr(), level: "info", msg: `▶ GET ${url}` },
    ]);

    const startMs = Date.now();

    try {
      const res = await fetch(url, { cache: "no-store" });
      const elapsed = Date.now() - startMs;

      if (!res.ok) {
        const errText = await res.text();
        setLogs((prev) => [
          ...prev,
          { ts: nowStr(), level: "error", msg: `✗ HTTP ${res.status} ${res.statusText} (${elapsed}ms)` },
          { ts: nowStr(), level: "error", msg: `Response: ${errText}` },
        ]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const count = data?.flightsList?.length ?? 0;
      const cacheKey = `search:flights:jetcost:${form.Org.toUpperCase()}:${form.Des.toUpperCase()}:${form.DDate}:${form.RDate || "none"}:${form.Adt}:${form.Chld}:${form.Inf}:${form.Cabin.toUpperCase()}:${form.RDate ? "round-trip" : "one-way"}:${form.DirectFlightsOnly ? "direct" : "any"}`;
      const sample = data?.flightsList?.[0];

      const newEntries: LogEntry[] = [
        { ts: nowStr(), level: "success", msg: `✓ HTTP 200 OK — ${elapsed}ms` },
        { ts: nowStr(), level: "success", msg: `[Jetcost Direct Search] Org=${form.Org.toUpperCase()}, Des=${form.Des.toUpperCase()}, DDate=${form.DDate} -> Found ${count} flights` },
        { ts: nowStr(), level: "info", msg: `[ExternalFlightProvider] [Jetcost Direct] Cache SET for key "${cacheKey}" (TTL: 300s)` },
      ];

      if (data?.minPrice !== undefined) {
        newEntries.push({ ts: nowStr(), level: "info", msg: `minPrice: $${data.minPrice} | maxPrice: $${data.maxPrice}` });
      }

      if (sample) {
        newEntries.push(
          { ts: nowStr(), level: "info", msg: "──────────────────────────────────────" },
          { ts: nowStr(), level: "info", msg: "Sample flightsList[0]:" },
          { ts: nowStr(), level: "info", msg: `  flightId  : ${sample.flightId}` },
          { ts: nowStr(), level: "info", msg: `  tranId    : ${sample.tranId}` },
          { ts: nowStr(), level: "info", msg: `  searchId  : ${sample.searchId}` },
          { ts: nowStr(), level: "info", msg: `  airline   : ${sample.airline?.code || sample.airline} | currency: ${sample.currency}` },
          { ts: nowStr(), level: "info", msg: `  totalCost : $${sample.totalCost}` },
          { ts: nowStr(), level: "info", msg: `  stops     : ${sample.stops}` },
          { ts: nowStr(), level: "info", msg: `  outbound legs : ${sample.outbound?.length ?? 0}` },
          ...(form.RDate ? [{ ts: nowStr(), level: "info" as const, msg: `  inbound legs  : ${sample.inbound?.length ?? 0}` }] : []),
        );
      }

      setLogs((prev) => [...prev, ...newEntries]);
      setResult(data);
    } catch (err: any) {
      const elapsed = Date.now() - startMs;
      setLogs((prev) => [
        ...prev,
        { ts: nowStr(), level: "error", msg: `✗ Request failed (${elapsed}ms): ${err.message}` },
        { ts: nowStr(), level: "warn", msg: "Is the backend running on port 4000?" },
      ]);
    }

    setLoading(false);
  }

  const fieldClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";
  const labelClass = "block text-xs font-medium text-white/50 mb-1";

  return (
    <div className="min-h-screen bg-[#0a0e1a] font-sans text-white">
      <Header />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">

        {/* Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            JetCost Integration Simulator
          </div>
          <h1 className="text-3xl font-bold text-white">Fake JetCost Test Page</h1>
          <p className="text-white/50 text-sm mt-1">
            Simulates exactly what JetCost sends to{" "}
            <code className="text-sky-400 bg-sky-900/30 px-1 py-0.5 rounded text-xs">
              /api/flights/search
            </code>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Form ── */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-widest">
              Search Params (C# Model)
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>[Required] Org</label>
                <input className={fieldClass} value={form.Org}
                  onChange={(e) => setForm({ ...form, Org: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>[Required] Des</label>
                <input className={fieldClass} value={form.Des}
                  onChange={(e) => setForm({ ...form, Des: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>DDate (DateTime)</label>
                <input type="date" className={fieldClass} value={form.DDate}
                  onChange={(e) => setForm({ ...form, DDate: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>RDate (DateTime? — blank = one-way)</label>
                <input type="date" className={fieldClass} value={form.RDate}
                  onChange={(e) => setForm({ ...form, RDate: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Adt (int)</label>
                <input type="number" min="1" className={fieldClass} value={form.Adt}
                  onChange={(e) => setForm({ ...form, Adt: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Chld (int)</label>
                <input type="number" min="0" className={fieldClass} value={form.Chld}
                  onChange={(e) => setForm({ ...form, Chld: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Inf (int)</label>
                <input type="number" min="0" className={fieldClass} value={form.Inf}
                  onChange={(e) => setForm({ ...form, Inf: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Cabin (string)</label>
                <select className={fieldClass} value={form.Cabin}
                  onChange={(e) => setForm({ ...form, Cabin: e.target.value })}>
                  <option>Economy</option>
                  <option>Premium_Economy</option>
                  <option>Business</option>
                  <option>First</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="direct" checked={form.DirectFlightsOnly}
                onChange={(e) => setForm({ ...form, DirectFlightsOnly: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded" />
              <label htmlFor="direct" className="text-sm text-white/60">
                DirectFlightsOnly (bool)
              </label>
            </div>

            <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ref (string)</label>
                <input className={fieldClass} value={form.Ref}
                  onChange={(e) => setForm({ ...form, Ref: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>TCode (string)</label>
                <input className={fieldClass} value={form.TCode}
                  onChange={(e) => setForm({ ...form, TCode: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>utm_source</label>
                <input className={fieldClass} value={form.utm_source}
                  onChange={(e) => setForm({ ...form, utm_source: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>utm_medium</label>
                <input className={fieldClass} value={form.utm_medium}
                  onChange={(e) => setForm({ ...form, utm_medium: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>utm_campaign</label>
                <input className={fieldClass} value={form.utm_campaign}
                  onChange={(e) => setForm({ ...form, utm_campaign: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>email</label>
                <input type="email" className={fieldClass} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>phoneNo</label>
                <input className={fieldClass} value={form.phoneNo}
                  onChange={(e) => setForm({ ...form, phoneNo: e.target.value })} />
              </div>
            </div>

            {/* URL preview */}
            <div className="rounded-lg bg-black/40 border border-white/10 p-3">
              <p className="text-[10px] text-white/40 mb-1 font-mono uppercase tracking-widest">
                GET URL (JetCost will call this)
              </p>
              <p className="text-xs text-sky-400 font-mono break-all leading-5">
                {buildUrl()}
              </p>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-sky-800 disabled:cursor-wait text-white font-semibold py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calling API…
                </>
              ) : (
                "▶  Run JetCost Search"
              )}
            </button>
          </div>

          {/* ── Log Panel ── */}
          <div
            className="rounded-2xl border border-white/10 bg-black/60 flex flex-col overflow-hidden"
            style={{ minHeight: 520 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                Backend Log Simulator
              </h2>
              {logs.length > 0 && (
                <button
                  onClick={() => { setLogs([]); setResult(null); }}
                  className="text-xs text-white/30 hover:text-white/60 transition"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-white/20 text-center mt-20 text-sm">
                  Hit &quot;Run JetCost Search&quot; to see logs
                </p>
              ) : (
                logs.map((l, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-white/30 shrink-0 tabular-nums">{l.ts}</span>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${LEVEL_BADGES[l.level]}`}
                    >
                      {l.level}
                    </span>
                    <span className={`${LEVEL_COLORS[l.level]} break-all`}>{l.msg}</span>
                  </div>
                ))
              )}
            </div>

            {/* Results summary bar */}
            {result && (
              <div className="border-t border-white/10 bg-emerald-900/20 px-4 py-3">
                <p className="text-xs text-emerald-400 font-semibold">
                  ✓ {result.flightsList?.length ?? 0} flights returned &nbsp;·&nbsp; Min $
                  {result.minPrice ?? 0} &nbsp;·&nbsp; Max ${result.maxPrice ?? 0}
                </p>
                <p className="text-xs text-white/30 mt-0.5 font-mono">
                  searchId: {result.flightsSearchRQ?.searchId || "—"} &nbsp;·&nbsp;
                  tranId: {result.flightsSearchRQ?.tranId || "—"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
