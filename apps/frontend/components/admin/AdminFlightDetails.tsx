"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getCompleteBookingInspector,
  CompleteBookingInspectorResult,
} from "@/lib/api/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plane,
  Loader2,
  AlertCircle,
  Eye,
  LayoutGrid,
  ShieldCheck,
  CreditCard,
  User,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Ticket,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function JsonViewer({ data }: { data: any }) {
  const [copied, setCopied] = useState(false);
  if (!data)
    return (
      <p className="text-xs text-muted-foreground italic">No data available.</p>
    );

  let formatted = "";
  try {
    formatted =
      typeof data === "string"
        ? JSON.stringify(JSON.parse(data), null, 2)
        : JSON.stringify(data, null, 2);
  } catch {
    formatted = String(data);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 px-2.5 py-1 rounded-xl bg-card border border-border/80 text-foreground hover:bg-muted font-semibold transition-all z-10 text-xs flex items-center gap-1.5 shadow-sm"
        title="Copy JSON"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <pre className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-emerald-400 font-mono text-[11.5px] leading-relaxed overflow-x-auto border border-slate-800/80 dark:border-slate-800 max-h-[320px] shadow-inner">
        {formatted}
      </pre>
    </div>
  );
}

export function AdminFlightDetails() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");

  const [bookingRefInput, setBookingRefInput] = useState("");
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [activeSearch, setActiveSearch] = useState<{
    bookingRef?: string;
    customerId?: string;
  } | null>(null);

  useEffect(() => {
    if (refParam) {
      const clean = refParam.trim();
      if (clean) {
        setBookingRefInput(clean);
        setActiveSearch({ bookingRef: clean });
      }
    }
  }, [refParam]);
  const [activeTab, setActiveTab] = useState<
    | "details"
    | "passengers"
    | "itinerary"
    | "refund_shield"
    | "refund_cnfrm"
    | "affirm"
    | "affirm_forms"
  >("details");
  const [viewMode, setViewMode] = useState<"parsed" | "raw">("raw");

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<CompleteBookingInspectorResult>({
      queryKey: [
        "booking-inspector",
        activeSearch?.bookingRef,
        activeSearch?.customerId,
      ],
      queryFn: () =>
        getCompleteBookingInspector({
          bookingRef: activeSearch?.bookingRef,
          customerId: activeSearch?.customerId,
        }),
      enabled: Boolean(activeSearch?.bookingRef || activeSearch?.customerId),
      retry: false,
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = bookingRefInput.trim();
    const cleanId = customerIdInput.trim();
    if (cleanRef || cleanId) {
      if (
        activeSearch?.bookingRef === cleanRef &&
        activeSearch?.customerId === cleanId
      ) {
        refetch();
      } else {
        setActiveSearch({
          bookingRef: cleanRef || undefined,
          customerId: cleanId || undefined,
        });
      }
    }
  };

  const showLoader = isLoading || isFetching;

  return (
    <div className="space-y-6">
      {/* Single BookingRef Search Header */}
      <div className="rounded-3xl border border-border/60 bg-card/65 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Search className="h-5 w-5 text-redmix" />
              Complete Booking Inspector
            </h2>
            {/* <p className="text-xs text-muted-foreground mt-0.5">
              Enter{" "}
              <strong className="text-foreground font-bold">BookingRef</strong>{" "}
              to inspect all 6 CRM tables on a single click.{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                (Customer ID is resolved automatically from tbl_customerdetails)
              </span>
              .
            </p> */}
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="text-[11.5px] font-bold text-foreground mb-1 block">
                Booking Reference
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g. 260806220322"
                  className="pl-10 rounded-2xl h-11 border-border/80 focus-visible:ring-redmix text-sm font-semibold"
                  value={bookingRefInput}
                  onChange={(e) => setBookingRefInput(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="rounded-2xl h-11 px-8 bg-redmix text-white font-semibold shadow-md shadow-redmix/20 transition-all w-full sm:w-auto shrink-0"
              disabled={
                showLoader ||
                (!bookingRefInput.trim() && !customerIdInput.trim())
              }
            >
              {showLoader ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Fetch Booking Data
            </Button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {showLoader ? (
        <div className="py-16 text-center text-muted-foreground">
          <Loader2 className="inline h-8 w-8 animate-spin text-redmix mb-3" />
          <p className="text-sm font-medium">
            Querying CRM database tables in parallel...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          <AlertCircle className="inline h-5 w-5 mr-2 mb-0.5" />
          Failed to fetch booking data: {String(error)}
        </div>
      ) : activeSearch && (!data || !data.found) ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
          <Plane className="inline h-10 w-10 opacity-30 mb-3" />
          <p className="text-sm font-medium text-foreground">
            No Booking Records Found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            No matching entries in CRM tables for Ref: "
            {activeSearch.bookingRef || "N/A"}", Customer ID: "
            {activeSearch.customerId || "N/A"}".
          </p>
        </div>
      ) : data && data.found ? (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-redmix to-redmix-light text-white shadow-md shadow-redmix/20">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-foreground text-lg">
                    Ref: {data.bookingRef || "N/A"}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-redmix/10 text-redmix border border-redmix/20">
                    Customer ID #{data.customerId || "N/A"}
                  </span>
                </div>
                <p className="text-xs text-foreground mt-0.5">
                  {data.customerDetails?.originFrom || "---"} →{" "}
                  {data.customerDetails?.destinationTo || "---"} • Airline:{" "}
                  {data.customerDetails?.airLine || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium self-start md:self-auto flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-muted/60 text-foreground font-bold border border-border/60">
                Total:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  ${data.customerDetails?.totalAmount ?? "N/A"}
                </strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Status: {data.customerDetails?.status || "Success"}
              </div>
            </div>
          </div>

          {/* Navigation Tabs for the 6 Tables */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border/50">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap",
                activeTab === "details"
                  ? "bg-redmix text-white shadow-md shadow-redmix/20"
                  : "text-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Customer Details
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("passengers")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap",
                activeTab === "passengers"
                  ? "bg-redmix text-white shadow-md shadow-redmix/20"
                  : "text-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Users className="h-3.5 w-3.5" />
              Travelers ({data.customers?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("itinerary")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap",
                activeTab === "itinerary"
                  ? "bg-redmix text-white shadow-md shadow-redmix/20"
                  : "text-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Plane className="h-3.5 w-3.5" />
              Flight Detail HTML
            </button>

            {/* <button
              type="button"
              onClick={() => setActiveTab("refund_shield")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap",
                activeTab === "refund_shield"
                  ? "bg-redmix text-white shadow-md shadow-redmix/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Refund Shield ({data.refundShield?.refund_status || "N/A"})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("refund_cnfrm")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap",
                activeTab === "refund_cnfrm"
                  ? "bg-redmix text-white shadow-md shadow-redmix/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Refund Shield bookingscnfrm;
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("affirm")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap",
                activeTab === "affirm"
                  ? "bg-redmix text-white shadow-md shadow-redmix/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Affirm Payment ({data.affirmPayments?.length || 0})
            </button> */}

            {/* <button
              type="button"
              onClick={() => setActiveTab("affirm_forms")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap",
                activeTab === "affirm_forms"
                  ? "bg-redmix text-white shadow-md shadow-redmix/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Affirm Forms ({data.affirmBookingForms?.length || 0})
            </button> */}
          </div>

          {/* TAB CONTENT PANELS */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            {/* TAB 1: Main Details */}
            {activeTab === "details" && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                  <FileText className="h-4 w-4 text-redmix" />
                  Table: `tbl_customerdetails` (where bookingRef='
                  {data.bookingRef}')
                </h4>
                {data.customerDetails ? (
                  <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
                    <Table className="text-xs">
                      <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent border-b border-border/60">
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Id / BookingRef
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Route / Airline
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Travel / Cabin
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Dates (Dep / Ret)
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Contact Info
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Status / Work Status
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Source (ID)
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Total Amount
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Refund Shield
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Created At
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-mono text-foreground font-bold">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-foreground text-[10px]">
                                #{data.customerDetails.id}
                              </span>
                              <span className="text-redmix dark:text-redmix-light font-bold text-xs bg-redmix/10 px-1.5 py-0.5 rounded-md w-fit">
                                {data.customerDetails.bookingRef}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="font-bold">
                                {data.customerDetails.originFrom}
                              </span>
                              <span className="text-foreground font-bold">
                                →
                              </span>
                              <span className="font-bold">
                                {data.customerDetails.destinationTo}
                              </span>
                            </div>
                            <div className="text-[10px] text-foreground font-bold mt-0.5">
                              Airline:{" "}
                              <span className="font-bold text-foreground">
                                {data.customerDetails.airLine || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold text-foreground border border-border/50">
                              {data.customerDetails.travellType || "N/A"}
                            </span>
                            <div className="text-[10px] text-foreground mt-0.5">
                              {data.customerDetails.cabin || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground whitespace-nowrap">
                            <div className="text-[11px] font-bold">
                              {data.customerDetails.departureDate || "N/A"}
                            </div>
                            {data.customerDetails.returnDate && (
                              <div className="text-[10px] text-foreground mt-0.5">
                                to {data.customerDetails.returnDate}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            <div
                              className="text-[11px] font-bold whitespace-nowrap"
                              title={data.customerDetails.email}
                            >
                              {data.customerDetails.email || "N/A"}
                            </div>
                            <div className="text-[10px] text-foreground mt-0.5">
                              {data.customerDetails.phone || "N/A"}
                            </div>
                            {data.customerDetails.address && (
                              <div className="text-[9px] text-foreground whitespace-nowrap mt-0.5">
                                {data.customerDetails.address}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            <div className="flex flex-col gap-1 w-fit">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                  data.customerDetails.status === "0"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                )}
                              >
                                {data.customerDetails.status === "0"
                                  ? "Confirmed"
                                  : `Status: ${data.customerDetails.status || "0"}`}
                              </span>
                              <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                                Work:{" "}
                                {data.customerDetails.work_status || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            <span className="text-[11px] font-bold">
                              {data.customerDetails.source || "N/A"}
                            </span>
                            <div className="text-[10px] text-foreground font-mono mt-0.5">
                              ID: {data.customerDetails.source_id || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            ${data.customerDetails.totalAmount}
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            <div className="flex flex-col gap-1">
                              <span
                                className={cn(
                                  "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold border w-fit",
                                  data.customerDetails.RefundShieldBooking ===
                                    "YES"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-slate-100 dark:bg-slate-800 text-foreground border-border",
                                )}
                              >
                                {data.customerDetails.RefundShieldBooking ||
                                  "N/A"}
                              </span>
                              <span className="text-[10px] text-foreground">
                                $
                                {data.customerDetails.RefundShieldTotalAmount ||
                                  0}{" "}
                                ({data.customerDetails.RefundShieldPercent || 0}
                                %)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground whitespace-nowrap text-[11px]">
                            {data.customerDetails.created_at || "N/A"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No record found in tbl_customerdetails.
                  </p>
                )}
              </div>
            )}

            {/* TAB 2: Passengers */}
            {activeTab === "passengers" && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                  <Users className="h-4 w-4 text-redmix" />
                  Table: `tbl_customer` (where customerId='{data.customerId}')
                </h4>
                {data.customers && data.customers.length > 0 ? (
                  <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
                    <Table className="text-xs">
                      <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent border-b border-border/60">
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            cId / customerId
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Full Name
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Passenger Type
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Gender
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            DOB
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Nationality
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Adult Price (Qty)
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Child Price (Qty)
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Infant Price (Qty)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.customers.map((pax: any, idx: number) => (
                          <TableRow
                            key={idx}
                            className="hover:bg-muted/10 transition-colors"
                          >
                            <TableCell className="font-mono text-[11px] text-foreground font-bold">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-foreground font-bold">
                                  #{pax.cId}
                                </span>
                                <span className="text-[10px] text-foreground font-bold">
                                  Cust: #{pax.customerId}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-foreground text-[13px]">
                              {pax.fullName}
                            </TableCell>
                            <TableCell className="font-bold">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase",
                                  pax.pessengerType?.toLowerCase() === "adult"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                    : pax.pessengerType?.toLowerCase() ===
                                        "child"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                                )}
                              >
                                {pax.pessengerType}
                              </span>
                            </TableCell>
                            <TableCell className="font-bold text-foreground">
                              {pax.gender || "---"}
                            </TableCell>
                            <TableCell className="font-bold text-foreground whitespace-nowrap">
                              {pax.dob || "---"}
                            </TableCell>
                            <TableCell className="font-bold text-foreground">
                              <span className="bg-slate-100 dark:bg-slate-800 border px-1.5 py-0.5 rounded font-bold text-[10px] text-foreground uppercase">
                                {pax.nationality || "USA"}
                              </span>
                            </TableCell>
                            <TableCell className="font-bold text-foreground text-[11px]">
                              ${pax.adtPrice || 0}{" "}
                              <span className="text-foreground font-bold">
                                ({pax.adtQty || 0})
                              </span>
                            </TableCell>
                            <TableCell className="font-bold text-foreground text-[11px]">
                              ${pax.chdPrice || 0}{" "}
                              <span className="text-foreground font-bold">
                                ({pax.chdQty || 0})
                              </span>
                            </TableCell>
                            <TableCell className="font-bold text-foreground text-[11px]">
                              ${pax.infPrice || 0}{" "}
                              <span className="text-foreground font-bold">
                                ({pax.infQty || 0})
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No passengers found in tbl_customer.
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: Flight Details HTML */}
            {activeTab === "itinerary" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Plane className="h-4 w-4 text-redmix" />
                    Table: `tbl_flightdetailshtml` (where customerId='
                    {data.customerId}')
                  </h4>
                  <div className="flex items-center bg-muted rounded-xl p-1 gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode("parsed")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg font-bold transition-all",
                        viewMode === "parsed"
                          ? "bg-redmix text-white"
                          : "text-foreground hover:bg-muted/80",
                      )}
                    >
                      Parsed Timeline
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("raw")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg font-bold transition-all",
                        viewMode === "raw"
                          ? "bg-redmix text-white"
                          : "text-foreground hover:bg-muted/80",
                      )}
                    >
                      Raw HTML
                    </button>
                  </div>
                </div>

                {data.parsedItinerary ? (
                  viewMode === "parsed" ? (
                    <div className="space-y-4 text-xs">
                      {data.parsedItinerary.outbound && (
                        <DirectionTimeline
                          direction={data.parsedItinerary.outbound}
                          cardTitle="Outbound Flight"
                        />
                      )}
                      {data.parsedItinerary.inbound && (
                        <>
                          <div className="pt-2 border-t border-dashed border-border" />
                          <DirectionTimeline
                            direction={data.parsedItinerary.inbound}
                            cardTitle="Return Flight"
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.parsedItinerary.rawOutboundHtml && (
                        <RawHtmlBlock
                          title="Outbound Flight HTML"
                          rawHtml={data.parsedItinerary.rawOutboundHtml}
                        />
                      )}
                      {data.parsedItinerary.rawInboundHtml && (
                        <RawHtmlBlock
                          title="Inbound Flight HTML"
                          rawHtml={data.parsedItinerary.rawInboundHtml}
                        />
                      )}
                    </div>
                  )
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No HTML itinerary found in tbl_flightdetailshtml.
                  </p>
                )}
              </div>
            )}

            {/* TAB 4: Refund Shield */}
            {activeTab === "refund_shield" && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Table: `refund_shield` (where booking_ref='{data.bookingRef}')
                </h4>
                {data.refundShield ? (
                  <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
                    <Table className="text-xs">
                      <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent border-b border-border/60">
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            id / booking_ref
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Refund Status / Price
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Trust Status / Price
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Pax Counts (Ad / Ch / Inf)
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Individual Prices
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Grand Total
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                            Created / Updated At
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-mono text-foreground font-bold">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-foreground text-[10px]">
                                #{data.refundShield.id}
                              </span>
                              <span className="text-redmix dark:text-redmix-light font-bold text-xs bg-redmix/10 px-1.5 py-0.5 rounded-md w-fit">
                                {data.refundShield.booking_ref}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            <span
                              className={cn(
                                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold border mr-2",
                                data.refundShield.refund_status === "YES"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-foreground border-border",
                              )}
                            >
                              {data.refundShield.refund_status}
                            </span>
                            <span className="font-bold">
                              ${data.refundShield.refund_price || 0}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            <span
                              className={cn(
                                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold border mr-1.5",
                                data.refundShield.trust_status === "YES"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-foreground border-border",
                              )}
                            >
                              {data.refundShield.trust_status || "NO"}
                            </span>
                            <span className="font-bold">
                              ${data.refundShield.trust_price || 0}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {data.refundShield.adult_count} Ad •{" "}
                            {data.refundShield.child_count} Ch •{" "}
                            {data.refundShield.infant_count} Inf
                          </TableCell>
                          <TableCell className="font-bold text-foreground text-[11px]">
                            Ad: ${data.refundShield.adult_price || 0} • Ch: $
                            {data.refundShield.child_price || 0} • Inf: $
                            {data.refundShield.infant_price || 0}
                          </TableCell>
                          <TableCell className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            ${data.refundShield.grand_tota || 0}
                          </TableCell>
                          <TableCell className="font-bold text-foreground whitespace-nowrap text-[11px]">
                            {data.refundShield.created_at || "N/A"}
                            <div className="text-[10px] text-foreground mt-0.5">
                              Updated: {data.refundShield.updated_at || "N/A"}
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No record in refund_shield table.
                  </p>
                )}
              </div>
            )}

            {/* TAB 5: RS Confirmation */}
            {activeTab === "refund_cnfrm" && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Table: `refundshieldbookingscnfrm` (where BookingRef='
                  {data.bookingRef}')
                </h4>
                {data.refundShieldCnfrm ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
                      <Table className="text-xs">
                        <TableHeader className="bg-muted/40">
                          <TableRow className="hover:bg-transparent border-b border-border/60">
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Id / BookingRef
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Customer Name
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Booking Name / Type
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Paid / Refundable
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Payment / Total Value
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Qty / Dates
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Created / Edited At
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-muted/10 transition-colors">
                            <TableCell className="font-mono text-foreground font-bold">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-foreground text-[10px]">
                                  #{data.refundShieldCnfrm.Id}
                                </span>
                                <span className="text-redmix dark:text-redmix-light font-bold text-xs bg-redmix/10 px-1.5 py-0.5 rounded-md w-fit">
                                  {data.refundShieldCnfrm.BookingRef}
                                </span>
                                <span className="text-[9px] text-foreground mt-0.5">
                                  Cust: #{data.refundShieldCnfrm.CustomerId}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-foreground text-[13px]">
                              {data.refundShieldCnfrm.FirstName}{" "}
                              {data.refundShieldCnfrm.LastName}
                            </TableCell>
                            <TableCell className="font-bold text-foreground">
                              <div className="font-bold text-xs">
                                {data.refundShieldCnfrm.BookingName || "N/A"}
                              </div>
                              <div className="mt-1">
                                <span className="bg-slate-100 dark:bg-slate-800 border px-1.5 py-0.5 rounded font-bold text-[9px] text-foreground uppercase">
                                  Type:{" "}
                                  {data.refundShieldCnfrm.BookingType || "TKT"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-foreground">
                              <div className="flex flex-col gap-1 w-fit">
                                <span
                                  className={cn(
                                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold border",
                                    data.refundShieldCnfrm.BookingPaidInFull
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                  )}
                                >
                                  Paid:{" "}
                                  {data.refundShieldCnfrm.BookingPaidInFull
                                    ? "True"
                                    : "False"}
                                </span>
                                <span
                                  className={cn(
                                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold border",
                                    data.refundShieldCnfrm.BookingIsRefundable
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : "bg-slate-100 dark:bg-slate-800 text-foreground border-border",
                                  )}
                                >
                                  Refundable:{" "}
                                  {data.refundShieldCnfrm.BookingIsRefundable
                                    ? "TRUE"
                                    : "FALSE"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-foreground">
                              <div className="text-[11px]">
                                Pay:{" "}
                                <span className="font-bold">
                                  $
                                  {data.refundShieldCnfrm.BookingPaymentValue ||
                                    0}
                                </span>
                              </div>
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                Total: $
                                {data.refundShieldCnfrm
                                  .BookingTotalTransactionValue || 0}{" "}
                                <span className="text-[9px] text-foreground">
                                  (
                                  {data.refundShieldCnfrm.CurrencyCode || "USD"}
                                  )
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-foreground whitespace-nowrap">
                              <div className="font-bold text-xs">
                                Qty:{" "}
                                {data.refundShieldCnfrm.BookingQuantity || 1}
                              </div>
                              <div className="text-[10px] text-foreground mt-0.5">
                                {data.refundShieldCnfrm.StartDateOfEvent ||
                                  "N/A"}{" "}
                                to{" "}
                                {data.refundShieldCnfrm.EndDateOfEvent || "N/A"}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-foreground whitespace-nowrap">
                              Pur:{" "}
                              {data.refundShieldCnfrm.DateOfPurchase || "N/A"}
                              <div className="text-[11px] text-foreground">
                                Created:{" "}
                                {data.refundShieldCnfrm.CreatedAt || "N/A"}
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h5 className="font-bold text-xs text-foreground mb-1">
                        Products Array (JSON):
                      </h5>
                      <JsonViewer data={data.refundShieldCnfrm.Products} />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No confirmation record in refundshieldbookingscnfrm.
                  </p>
                )}
              </div>
            )}

            {/* TAB 6: Affirm Payment */}
            {activeTab === "affirm" && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                  <CreditCard className="h-4 w-4 text-redmix" />
                  Table: `affirmpayment` (where BookingRef='{data.bookingRef}')
                </h4>
                {data.affirmPayments && data.affirmPayments.length > 0 ? (
                  <div className="space-y-6 text-xs">
                    <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
                      <Table className="text-xs">
                        <TableHeader className="bg-muted/40">
                          <TableRow className="hover:bg-transparent border-b border-border/60">
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Id / BookingRef
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Checkout Token
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Payment Amount
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Status / Flagged / Review
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Customer Contact
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Paid / Created At
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.affirmPayments.map((pay: any, idx: number) => (
                            <TableRow
                              key={idx}
                              className="hover:bg-muted/10 transition-colors"
                            >
                              <TableCell className="font-mono text-foreground font-bold">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-foreground text-[10px]">
                                    #{pay.Id}
                                  </span>
                                  <span className="text-foreground font-bold text-xs">
                                    {pay.BookingRef}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono font-bold text-redmix text-[11px]">
                                {pay.CheckoutToken}
                              </TableCell>
                              <TableCell className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                ${pay.PaymentAmount}{" "}
                                <span className="text-[10px] text-foreground font-bold">
                                  {pay.Currency}
                                </span>
                              </TableCell>
                              <TableCell className="font-bold text-foreground">
                                <div className="flex flex-col gap-1 w-fit">
                                  <span
                                    className={cn(
                                      "font-bold px-2 py-0.5 rounded text-[10px] inline-block border w-fit uppercase",
                                      pay.PaymentStatus?.toLowerCase() ===
                                        "authorized" ||
                                        pay.PaymentStatus?.toLowerCase() ===
                                          "captured"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                    )}
                                  >
                                    {pay.PaymentStatus}
                                  </span>
                                  <div className="text-[10px] text-foreground font-bold">
                                    Flagged:{" "}
                                    <span
                                      className={cn(
                                        "font-bold",
                                        pay.is_flagged
                                          ? "text-red-500"
                                          : "text-foreground",
                                      )}
                                    >
                                      {pay.is_flagged ? "YES" : "NO"}
                                    </span>{" "}
                                    • Rev:{" "}
                                    <span className="font-bold">
                                      {pay.payment_review_status || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-bold text-foreground">
                                <div className="text-[11px] font-bold">
                                  {pay.Email || "N/A"}
                                </div>
                                <div className="text-[10px] text-foreground mt-0.5">
                                  {pay.Phone || "N/A"}
                                </div>
                              </TableCell>
                              <TableCell className="font-bold text-foreground whitespace-nowrap text-[11px]">
                                <div>Paid: {pay.PaidAt || "N/A"}</div>
                                <div className="text-[10px] text-foreground mt-0.5">
                                  Created: {pay.CreatedAt || "N/A"}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {data.affirmPayments.map((pay: any, idx: number) => (
                      <div key={idx} className="space-y-3">
                        {pay.PaymentResponseJson && (
                          <div>
                            <h5 className="font-bold text-xs text-foreground mb-1">
                              PaymentResponseJson:
                            </h5>
                            <JsonViewer data={pay.PaymentResponseJson} />
                          </div>
                        )}

                        <div>
                          <h5 className="font-bold text-xs text-foreground mb-1">
                            FullCardResponse JSON (VCN Card Details):
                          </h5>
                          <JsonViewer data={pay.FullCardResponse} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No payment record found in affirmpayment.
                  </p>
                )}
              </div>
            )}

            {/* TAB 7: Affirm Booking Forms */}
            {activeTab === "affirm_forms" && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                  <FileText className="h-4 w-4 text-purple-500" />
                  Table: `affirmbookingforms` (where id='{data.customerId}' or
                  UniqueId='{data.bookingRef}')
                </h4>
                {data.affirmBookingForms &&
                data.affirmBookingForms.length > 0 ? (
                  <div className="space-y-6 text-xs">
                    <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
                      <Table className="text-xs">
                        <TableHeader className="bg-muted/40">
                          <TableRow className="hover:bg-transparent border-b border-border/60">
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Id / UniqueId
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Customer Contact
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Marketing Class
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Route / Dates
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Prices (Ad / Ch / Inf)
                            </TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-wider text-foreground py-3">
                              Link Expiry / CreatedAt
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.affirmBookingForms.map(
                            (form: any, idx: number) => (
                              <TableRow
                                key={idx}
                                className="hover:bg-muted/10 transition-colors"
                              >
                                <TableCell className="font-mono text-foreground font-bold">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-foreground text-[10px]">
                                      #{form.Id || form.id}
                                    </span>
                                    <span className="text-foreground font-bold text-xs">
                                      {form.UniqueId}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-bold text-foreground">
                                  <div className="text-[11px] font-bold">
                                    {form.Email || "N/A"}
                                  </div>
                                  <div className="text-[10px] text-foreground mt-0.5">
                                    {form.PhoneNo || "N/A"}
                                  </div>
                                </TableCell>
                                <TableCell className="font-bold text-foreground">
                                  <span className="bg-slate-100 dark:bg-slate-800 border px-1.5 py-0.5 rounded font-bold text-[10px] text-foreground uppercase">
                                    {form.MarketingClass || "N/A"}
                                  </span>
                                </TableCell>
                                <TableCell className="font-bold text-foreground whitespace-nowrap">
                                  <div className="flex items-center gap-1 font-bold">
                                    <span>{form.Depart || "N/A"}</span>
                                    <span className="text-foreground font-bold">
                                      →
                                    </span>
                                    <span>{form.Arrive || "N/A"}</span>
                                  </div>
                                  <div className="text-[10px] text-foreground mt-0.5">
                                    {form.DepartDate || "N/A"} to{" "}
                                    {form.ReturnDate || "N/A"}
                                  </div>
                                </TableCell>
                                <TableCell className="font-bold text-foreground text-[11px]">
                                  Ad:{" "}
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    ${form.AdultsPrice || 0}
                                  </span>{" "}
                                  • Ch:{" "}
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    ${form.ChildPrice || 0}
                                  </span>{" "}
                                  • Inf:{" "}
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    ${form.InfantPrice || 0}
                                  </span>
                                </TableCell>
                                <TableCell className="font-bold text-foreground whitespace-nowrap text-[11px]">
                                  <div>Exp: {form.LinkExpiryDate || "N/A"}</div>
                                  <div className="text-[10px] text-foreground mt-0.5">
                                    Created:{" "}
                                    {form.CreatedAt || form.Created_at || "N/A"}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {data.affirmBookingForms.map((form: any, idx: number) => (
                      <div key={idx} className="space-y-3">
                        {form.PassengerJson && (
                          <div>
                            <h5 className="font-bold text-xs text-foreground mb-1">
                              PassengerJson:
                            </h5>
                            <JsonViewer data={form.PassengerJson} />
                          </div>
                        )}

                        {form.OutboundFlightsJson && (
                          <div>
                            <h5 className="font-bold text-xs text-foreground mb-1">
                              OutboundFlightsJson:
                            </h5>
                            <JsonViewer data={form.OutboundFlightsJson} />
                          </div>
                        )}

                        {form.InboundFlightsJson && (
                          <div>
                            <h5 className="font-bold text-xs text-foreground mb-1">
                              InboundFlightsJson:
                            </h5>
                            <JsonViewer data={form.InboundFlightsJson} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No entries found in affirmbookingforms (Legacy form table).
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DirectionTimeline({
  direction,
  cardTitle,
}: {
  direction: any;
  cardTitle: string;
}) {
  const isInbound =
    cardTitle.toLowerCase().includes("return") ||
    cardTitle.toLowerCase().includes("inbound");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-foreground tracking-wider flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isInbound ? "bg-emerald-500" : "bg-redmix",
            )}
          />
          {cardTitle}
        </h4>
        {direction.date && (
          <span className="text-[11px] text-muted-foreground font-semibold px-2 py-0.5 bg-muted rounded-md">
            {direction.date}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-3 mb-4 shadow-sm w-full">
        <div className="flex items-center gap-2 min-w-[80px]">
          <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-900 text-white">
            {direction.title || (isInbound ? "INBOUND" : "OUTBOUND")}
          </span>
        </div>
        <div className="flex items-center justify-between flex-grow">
          <span className="text-lg font-black text-slate-900 tracking-tight">
            {direction.origin || "---"}
          </span>
          <div className="flex-grow flex items-center justify-center px-4">
            <div className="w-full border-t border-dashed border-slate-300 relative flex items-center justify-center">
              <div className="absolute bg-slate-50 px-2">
                <Plane
                  className={cn(
                    "h-4 w-4 text-slate-400",
                    isInbound && "rotate-180",
                  )}
                />
              </div>
            </div>
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">
            {direction.destination || "---"}
          </span>
        </div>
      </div>

      <div className="space-y-4 relative pl-4 border-l border-dashed border-border ml-2">
        {direction.segments?.map((segment: any, idx: number) => (
          <div key={idx} className="relative space-y-2">
            <div
              className={cn(
                "absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-card border-2",
                isInbound ? "border-emerald-500" : "border-redmix",
              )}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground">
                {segment.airline} • {segment.flightNo}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-muted font-semibold text-xs capitalize text-redmix/80">
                {segment.cabin || "Economy"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
              <div>
                <p className="text-foreground/90 font-medium">Departure</p>
                <p className="font-bold text-foreground/90">
                  {segment.depTime || "---"}
                </p>
              </div>
              <div>
                <p className="text-foreground/90 font-medium">Arrival</p>
                <p className="font-bold text-foreground/90">
                  {segment.arrTime || "---"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RawHtmlBlock({ title, rawHtml }: { title: string; rawHtml: string }) {
  return (
    <div className="space-y-3">
      <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
      <div className="flight-details-raw overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-[#222]">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .flight-details-raw table { border-collapse: collapse; }
          .flight-details-raw td { padding: 5px; }
          .flight-details-raw img { display: inline-block; max-width: none; }
        `,
          }}
        />
        <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
      </div>
    </div>
  );
}
