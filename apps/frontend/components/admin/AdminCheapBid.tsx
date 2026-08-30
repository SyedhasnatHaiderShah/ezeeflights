"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCheapBids,
  createCheapBid,
  updateCheapBid,
  deleteCheapBid,
  deleteAllCheapBids,
  deleteBulkCheapBids,
  getCheapBid,
  CheapBidOfferRow,
  CreateCheapBidDto,
  UpdateCheapBidDto,
  CheapBidSegmentDto,
  getCheapBidStatus,
  updateCheapBidStatus,
  uploadCheapBids,
} from "@/lib/api/admin-api";
import { AdminDataTable } from "./AdminDataTable";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { FlightCard } from "@/components/flights/FlightCard";
import { cheapBidOfferToFlightListItem } from "@/lib/utils/cheap-bid-flight";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LocationInput } from "@/components/ui/location-input";
import { AirlineInput } from "@/components/ui/airline-input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { addDays, format, isValid, startOfDay } from "date-fns";
import {
  Trash2,
  Plus,
  Loader2,
  Tag,
  Plane,
  Eye,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import {
  getAirportByCode,
  getAirportByCodeSync,
} from "@/lib/utils/airport-search";
import { useCurrencyStore } from "@/lib/store/currency-store";
import { useToast } from "@/lib/hooks/use-toast";

const SOURCES = [
  "Ezeeflight US",
  "Ezeeflight CA",
  "Ezeeflight UK",
  "TravelHeights UK",
  "Ezeeflights UAE",
  "Thedealchecker",
  "Ezee Trips",
] as const;

const CABIN_CLASSES = [
  "Economy",
  "Premium Economy",
  "Business",
  "First",
] as const;

const TRAVEL_TYPES = ["Return", "OneWay"] as const;

const CURRENCIES = ["USD", "GBP", "CAD", "EUR", "AED"] as const;

const LIMIT = 10;

/** AC 8631 LGA→YUL + AC 1424 YUL→PUJ — dev prefill & production placeholders */
const isDevCheapBidDefaults = process.env.NODE_ENV === "development";

const CHEAP_BID_SAMPLE = {
  source: "Ezeeflight CA",
  origin: "LGA",
  destination: "PUJ",
  airline: "AC",
  cabin: "Economy",
  currency: "USD",
  prices: {
    bidAdt: 240,
    bidChd: 200,
    bidInf: 50,
  },
  leg1: {
    airlineCode: "AC",
    airlineNameNumber: "AC-8631",
    depart: "LGA",
    arrive: "YUL",
    departHour: 6,
    departMin: 30,
    arriveHour: 8,
    arriveMin: 0,
    totalTime: "1h 30m",
    stopTime: "",
  },
  leg2: {
    airlineCode: "AC",
    airlineNameNumber: "AC-1424",
    depart: "YUL",
    arrive: "PUJ",
    departHour: 11,
    departMin: 40,
    arriveHour: 16,
    arriveMin: 5,
    totalTime: "4h 25m",
    stopTime: "3h 40m layover in Montréal (YUL)",
  },
} as const;

const SEGMENT_EXAMPLES = {
  leg1: {
    stopTime: "Non-stop (leg 1)",
    airlineCode: "AC",
    airlineNameNumber: "AC-8631",
    depart: "LGA",
    arrive: "YUL",
    totalTime: "1h 30m",
    departTime: "06:30",
    arriveTime: "08:00",
  },
  leg2: {
    stopTime: "3h 40m layover in Montréal (YUL)",
    airlineCode: "AC",
    airlineNameNumber: "AC-1424",
    depart: "YUL",
    arrive: "PUJ",
    totalTime: "4h 25m",
    departTime: "11:40",
    arriveTime: "16:05",
  },
  inbound: {
    stopTime: "e.g. 2h layover in LHR",
    airlineCode: "AC",
    airlineNameNumber: "AC-1424",
    depart: "PUJ",
    arrive: "LGA",
    totalTime: "4h 25m",
    departTime: "11:40",
    arriveTime: "16:05",
  },
} as const;

type SegmentFieldExamples =
  (typeof SEGMENT_EXAMPLES)[keyof typeof SEGMENT_EXAMPLES];

function sampleTravelDate(): Date {
  const today = startOfDay(new Date());
  let travel = new Date(today.getFullYear(), 6, 16);
  if (travel < today) {
    travel = new Date(today.getFullYear() + 1, 6, 16);
  }
  return travel;
}

function localDateTime(date: Date, hours: number, minutes: number): string {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hours)}:${pad(minutes)}:00`;
}

function buildDevCheapBidForm(): CreateCheapBidDto {
  const today = startOfDay(new Date());
  const travelDate = sampleTravelDate();
  const expiry = addDays(today, 7);

  return {
    source: CHEAP_BID_SAMPLE.source,
    originFrom: CHEAP_BID_SAMPLE.origin,
    destinationTo: CHEAP_BID_SAMPLE.destination,
    airLine: CHEAP_BID_SAMPLE.airline,
    travellType: "OneWay",
    cabin: CHEAP_BID_SAMPLE.cabin,
    departureDate: travelDate.toISOString(),
    returnDate: undefined,
    bidAdtPrice: CHEAP_BID_SAMPLE.prices.bidAdt,
    bidChdPrice: CHEAP_BID_SAMPLE.prices.bidChd,
    bidInfPrice: CHEAP_BID_SAMPLE.prices.bidInf,
    currency: CHEAP_BID_SAMPLE.currency,
    discountType: "replace",
    linkExpiryDate: expiry.toISOString(),
  };
}

function buildEmptyCheapBidForm(): CreateCheapBidDto {
  const today = startOfDay(new Date());
  const expiry = addDays(today, 7);
  const dep = addDays(today, 14);
  const ret = addDays(today, 21);

  return {
    source: "Ezeeflight US",
    originFrom: "",
    destinationTo: "",
    airLine: "",
    travellType: "OneWay",
    cabin: "Economy",
    departureDate: dep.toISOString(),
    returnDate: ret.toISOString(),
    bidAdtPrice: null,
    bidChdPrice: null,
    bidInfPrice: null,
    currency: "USD",
    discountType: "replace",
    linkExpiryDate: expiry.toISOString(),
  };
}

const IOS_INPUT =
  "rounded-2xl border border-border bg-muted/30 h-11 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-primary/30 transition-colors hover:bg-muted/40 disabled:opacity-100 disabled:text-foreground disabled:bg-muted/10";
const IOS_SELECT =
  "rounded-2xl border border-border bg-muted/30 h-11 text-sm shadow-sm transition-colors hover:bg-muted/40 disabled:opacity-100 disabled:text-foreground disabled:bg-muted/10";

function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return dateStr;

    // Check if the ISO string represents a date-only value (stored as UTC midnight)
    const isDateOnly =
      dateStr.endsWith("T00:00:00.000Z") ||
      dateStr.endsWith("T00:00:00Z") ||
      /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

    if (isDateOnly) {
      // Return date only in UTC to prevent timezone shifts (e.g., 25-08-2026)
      const day = String(d.getUTCDate()).padStart(2, "0");
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const year = d.getUTCFullYear();
      return `${day}-${month}-${year}`;
    }

    // Return date and time in UTC to prevent local timezone shifts
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    let hours = d.getUTCHours();
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    const seconds = String(d.getUTCSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, "0");

    return `${day}-${month}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
  } catch {
    return dateStr;
  }
}

function formatDateOnly(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (!isValid(d)) return dateStr;

    // Return date only in UTC to prevent timezone shifts
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
}

function AirportCity({ code }: { code: string }) {
  const [city, setCity] = useState("");
  useEffect(() => {
    if (!code) {
      setCity("");
      return;
    }
    getAirportByCode(code).then((a) => {
      if (a) setCity(a.municipality || a.name.split(" ")[0]);
    });
  }, [code]);
  return city ? (
    <span className="text-[11px] font-semibold text-foreground ml-1">
      ({city})
    </span>
  ) : null;
}

const blankForm = (): CreateCheapBidDto =>
  isDevCheapBidDefaults ? buildDevCheapBidForm() : buildEmptyCheapBidForm();

function toIsoDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return isValid(d) ? d.toISOString() : String(value);
}

function getTimeFromDateString(dateStr: string | undefined): string {
  if (!dateStr) return "12:00";
  const isDateOnly =
    dateStr.endsWith("T00:00:00.000Z") ||
    dateStr.endsWith("T00:00:00Z") ||
    /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  if (isDateOnly) return "";

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "12:00";
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function combineDateAndTime(
  dateStr: string | undefined,
  timeStr: string,
): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (!timeStr) {
    d.setUTCHours(0, 0, 0, 0);
  } else {
    const [hours, minutes] = timeStr.split(":").map(Number);
    d.setUTCHours(hours || 0, minutes || 0, 0, 0);
  }
  return d.toISOString();
}

function offerToForm(offer: CheapBidOfferRow): CreateCheapBidDto {
  return {
    source: offer.source || "Ezeeflight US",
    originFrom: offer.originFrom || "",
    destinationTo: offer.destinationTo || "",
    airLine: offer.airLine || "",
    travellType: offer.travellType || "OneWay",
    cabin: offer.cabin || "Economy",
    departureDate: toIsoDate(offer.departureDate),
    returnDate: offer.returnDate ? toIsoDate(offer.returnDate) : undefined,
    bidAdtPrice: offer.bidAdtPrice ?? null,
    bidChdPrice: offer.bidChdPrice ?? null,
    bidInfPrice: offer.bidInfPrice ?? null,
    currency: offer.currency || "USD",
    discountType: offer.discountType || "replace",
    linkExpiryDate: toIsoDate(offer.linkExpiryDate),
    flightId: offer.flightId,
    stops: offer.stops ?? null,
  };
}

function buildCheapBidPayload(form: CreateCheapBidDto): CreateCheapBidDto {
  const payload: CreateCheapBidDto = {
    ...form,
    originFrom: form.originFrom || "",
    destinationTo: form.destinationTo || "",
    departureDate: form.departureDate || new Date().toISOString(),
    airLine: form.airLine || "",
    travellType: form.travellType || "OneWay",
    cabin: form.cabin || "Economy",
    currency: form.currency || "USD",
    stops: form.stops === undefined ? null : form.stops,
  };

  // Never save original prices, only store bid prices
  delete payload.originalAdtPrice;
  delete payload.originalChdPrice;
  delete payload.originalInfPrice;

  // Clean UI-only property
  delete (payload as any).coarseMatch;

  return payload;
}

function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 overflow-visible", className)}>
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-foreground px-1">
        {label}
      </Label>
      {children}
      {hint && <span className="text-[11px] text-foreground px-1">{hint}</span>}
    </div>
  );
}

function LocationField({
  label,
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label} className={className}>
      <div
        className={cn(
          "rounded-2xl border border-border h-11 transition-colors bg-muted/30 hover:bg-muted/40 overflow-visible flex items-center",
          disabled &&
            "opacity-100 bg-muted/10 text-foreground pointer-events-none",
        )}
      >
        <LocationInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="rounded-2xl h-11 bg-transparent w-full"
          glassPopover={false}
          openOnHover={false}
          shimmer={false}
          disabled={disabled}
        />
      </div>
    </Field>
  );
}

function AirlineField({
  label,
  value,
  onChange,
  placeholder = "Select airline",
  allowAny = true,
  className,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  allowAny?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label} className={className}>
      <div
        className={cn(
          "rounded-2xl border border-border h-11 transition-colors bg-muted/30 hover:bg-muted/40 overflow-visible flex items-center",
          disabled &&
            "opacity-100 bg-muted/10 text-foreground pointer-events-none",
        )}
      >
        <AirlineInput
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          allowAny={allowAny}
          className="h-11 rounded-2xl w-full"
          disabled={disabled}
        />
      </div>
    </Field>
  );
}

function AmountInput({
  value,
  onChange,
  placeholder = "0",
  className,
}: {
  value: number | null | undefined;
  onChange: (val: number | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const [localValue, setLocalValue] = useState<string>(
    value === undefined || value === null ? "" : String(value),
  );

  useEffect(() => {
    const parentNum = value === undefined || value === null ? null : value;
    const localNum =
      localValue === "" || localValue === "." ? null : Number(localValue);
    if (parentNum !== localNum) {
      setLocalValue(value === undefined || value === null ? "" : String(value));
    }
  }, [value]);

  return (
    <Input
      type="text"
      placeholder={placeholder}
      className={cn(
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className,
      )}
      value={localValue}
      onFocus={(e) => {
        if (e.target.value === "0" || e.target.value === "") {
          e.target.select();
        }
      }}
      onChange={(e) => {
        let text = e.target.value;
        text = text.replace(/[^0-9.]/g, "");
        const parts = text.split(".");
        if (parts.length > 2) {
          text = parts[0] + "." + parts.slice(1).join("");
        }

        setLocalValue(text);

        if (text === "" || text === ".") {
          onChange(null);
        } else {
          const parsed = Number(text);
          if (!isNaN(parsed)) {
            onChange(parsed);
          }
        }
      }}
    />
  );
}

function AddCheapBidForm({
  form,
  onChange,
  onSubmit,
  isLoading,
  mode = "create",
}: {
  form: CreateCheapBidDto;
  onChange: (f: CreateCheapBidDto) => void;
  onSubmit: () => void;
  isLoading: boolean;
  mode?: "create" | "edit";
}) {
  const isEdit = mode === "edit";
  const set = (key: keyof CreateCheapBidDto, value: any) =>
    onChange({ ...form, [key]: value });

  const outboundOrigin = form.originFrom || "";
  const outboundDest = form.destinationTo || "";

  const previewFlight = Boolean(form.flightId)
    ? cheapBidOfferToFlightListItem(form as any)
    : null;

  const adtChanged =
    form.originalAdtPrice !== undefined && form.originalAdtPrice !== null
      ? Number(form.bidAdtPrice) !== Number(form.originalAdtPrice)
      : true;
  const chdChanged =
    form.originalChdPrice !== undefined && form.originalChdPrice !== null
      ? Number(form.bidChdPrice) !== Number(form.originalChdPrice)
      : true;
  const infChanged =
    form.originalInfPrice !== undefined && form.originalInfPrice !== null
      ? Number(form.bidInfPrice) !== Number(form.originalInfPrice)
      : true;
  const anyPriceChanged = adtChanged || chdChanged || infChanged;

  const hasAnyPrice =
    (form.bidAdtPrice ?? 0) > 0 ||
    (form.bidChdPrice ?? 0) > 0 ||
    (form.bidInfPrice ?? 0) > 0;

  const canSubmit =
    Boolean(outboundOrigin && outboundDest) &&
    hasAnyPrice &&
    anyPriceChanged;

  return (
    <div className="flex flex-col gap-6 pt-2 max-h-[75vh] overflow-y-auto px-1">
      {!isEdit && isDevCheapBidDefaults && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-950 dark:text-amber-100">
          <strong>Development mode:</strong> form pre-filled with Air Canada LGA
          → PUJ sample for local testing.
        </div>
      )}

      {/* ─── SECTION 1: BID PRICES & EXPIRY ─── */}
      <div className="rounded-2xl border border-border/70 bg-card/95 p-5 flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-border/50">
          <Tag className="h-4 w-4 text-primary" /> Bid Prices & Expiry Date
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <Field
            label={
              form.discountType === "percentage"
                ? "Adult Discount (%)"
                : form.discountType === "fixed"
                  ? "Adult Discount ($)"
                  : "Adults Price"
            }
            hint={
              form.originalAdtPrice
                ? `Original: $${form.originalAdtPrice}`
                : undefined
            }
          >
            <AmountInput
              placeholder={
                isDevCheapBidDefaults
                  ? "Adults Price"
                  : form.discountType === "percentage"
                    ? "e.g. 10"
                    : form.discountType === "fixed"
                      ? "e.g. 50"
                      : `e.g. ${CHEAP_BID_SAMPLE.prices.bidAdt}`
              }
              className={cn(IOS_INPUT, "bg-background font-medium")}
              value={form.bidAdtPrice}
              onChange={(val) => set("bidAdtPrice", val)}
            />
          </Field>

          <Field
            label={
              form.discountType === "percentage"
                ? "Child Discount (%)"
                : form.discountType === "fixed"
                  ? "Child Discount ($)"
                  : "Child Price"
            }
            hint={
              form.originalChdPrice
                ? `Original: $${form.originalChdPrice}`
                : undefined
            }
          >
            <AmountInput
              placeholder={
                isDevCheapBidDefaults
                  ? "Child Price"
                  : form.discountType === "percentage"
                    ? "e.g. 10"
                    : form.discountType === "fixed"
                      ? "e.g. 40"
                      : `e.g. ${CHEAP_BID_SAMPLE.prices.bidChd}`
              }
              className={cn(IOS_INPUT, "bg-background font-medium")}
              value={form.bidChdPrice}
              onChange={(val) => set("bidChdPrice", val)}
            />
          </Field>

          <Field
            label={
              form.discountType === "percentage"
                ? "Infant Discount (%)"
                : form.discountType === "fixed"
                  ? "Infant Discount ($)"
                  : "Infant Price"
            }
            hint={
              form.originalInfPrice !== undefined &&
              form.originalInfPrice !== null
                ? `Original: $${form.originalInfPrice}`
                : undefined
            }
          >
            <AmountInput
              placeholder={
                isDevCheapBidDefaults
                  ? "Infant Price"
                  : form.discountType === "percentage"
                    ? "e.g. 10"
                    : form.discountType === "fixed"
                      ? "e.g. 10"
                      : `e.g. ${CHEAP_BID_SAMPLE.prices.bidInf}`
              }
              className={cn(IOS_INPUT, "bg-background font-medium")}
              value={form.bidInfPrice}
              onChange={(val) => set("bidInfPrice", val)}
            />
          </Field>

          <Field label="Markup Type">
            <Select
              value={form.discountType || "replace"}
              onValueChange={(val) => set("discountType", val)}
            >
              <SelectTrigger
                className={cn(
                  IOS_SELECT,
                  "bg-background font-medium h-11 w-full",
                )}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="replace">replace</SelectItem>
                <SelectItem value="percentage">percentage</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Link Expiry Date">
            <div className="rounded-2xl border border-border h-11 transition-colors bg-muted/30 hover:bg-muted/40 overflow-visible flex items-center">
              <DatePicker
                date={
                  form.linkExpiryDate
                    ? new Date(form.linkExpiryDate)
                    : undefined
                }
                setDate={(d) => set("linkExpiryDate", d ? d.toISOString() : "")}
                label="Select Expiry Date"
                className="rounded-2xl h-11 w-full bg-transparent"
                glassPopover={false}
                openOnHover={false}
                toYear={new Date().getFullYear() + 2}
                disablePastDates={true}
              />
            </div>
          </Field>
        </div>

        {/* Source Selection */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
          <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Select Source
          </Label>
          <div className="flex flex-wrap items-center gap-2.5">
            {SOURCES.map((src) => {
              const isSelected = form.source === src;
              return (
                <label
                  key={src}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all select-none",
                    isSelected
                      ? "bg-redmix text-white border-none shadow-sm scale-[1.02]"
                      : "border-border bg-background/80 hover:bg-muted/60 text-foreground",
                  )}
                >
                  <input
                    type="radio"
                    name="source"
                    value={src}
                    checked={isSelected}
                    onChange={() => set("source", src)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      isSelected ? "bg-white" : "bg-muted-foreground/30",
                    )}
                  />
                  {src}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: ROUTE & SCHEDULE ─── */}
      <div className="rounded-2xl border border-border/70 bg-card/95 p-5 flex flex-col gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-border/50">
          <Plane className="h-4 w-4 text-primary" /> Route & Carrier Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <LocationField
            label="Origin Airport"
            value={form.originFrom || ""}
            onChange={(val) => set("originFrom", val)}
            placeholder="e.g. LGA"
          />
          <LocationField
            label="Destination Airport"
            value={form.destinationTo || ""}
            onChange={(val) => set("destinationTo", val)}
            placeholder="e.g. PUJ"
          />
          <AirlineField
            label="Airline Code"
            value={form.airLine || ""}
            onChange={(code) => set("airLine", code)}
            placeholder="e.g. AC"
            allowAny={false}
          />
          <Field label="Cabin Class">
            <Select
              value={form.cabin || "Economy"}
              onValueChange={(val) => set("cabin", val)}
            >
              <SelectTrigger
                className={cn(
                  IOS_SELECT,
                  "bg-background font-medium h-11 w-full",
                )}
              >
                <SelectValue placeholder="Select cabin" />
              </SelectTrigger>
              <SelectContent>
                {CABIN_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Stops">
            <Select
              value={
                form.stops !== undefined && form.stops !== null
                  ? String(form.stops)
                  : "any"
              }
              onValueChange={(val) =>
                set("stops", val === "any" ? null : Number(val))
              }
            >
              <SelectTrigger
                className={cn(
                  IOS_SELECT,
                  "bg-background font-medium h-11 w-full",
                )}
              >
                <SelectValue placeholder="Any Stops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Stops</SelectItem>
                <SelectItem value="0">Direct only</SelectItem>
                <SelectItem value="1">1 Stop max</SelectItem>
                <SelectItem value="2">2 Stops max</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Journey Type">
            <Select
              value={form.travellType || "OneWay"}
              onValueChange={(val) => {
                set("travellType", val);
                if (val === "OneWay") {
                  set("returnDate", undefined);
                } else if (!form.returnDate) {
                  set(
                    "returnDate",
                    addDays(
                      new Date(form.departureDate || new Date()),
                      7,
                    ).toISOString(),
                  );
                }
              }}
            >
              <SelectTrigger
                className={cn(
                  IOS_SELECT,
                  "bg-background font-medium h-11 w-full",
                )}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TRAVEL_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Departure Date">
              <div className="rounded-2xl border border-border h-11 transition-colors bg-muted/30 hover:bg-muted/40 overflow-visible flex items-center">
                <DatePicker
                  date={
                    form.departureDate
                      ? new Date(form.departureDate)
                      : undefined
                  }
                  setDate={(d) => {
                    if (!d) {
                      set("departureDate", "");
                      return;
                    }
                    const currentTime = getTimeFromDateString(
                      form.departureDate,
                    );
                    const updated = combineDateAndTime(
                      d.toISOString(),
                      currentTime,
                    );
                    set("departureDate", updated);
                  }}
                  label="Select Departure Date"
                  className="rounded-2xl h-11 w-full bg-transparent"
                  glassPopover={false}
                  openOnHover={false}
                  toYear={new Date().getFullYear() + 2}
                  disablePastDates={true}
                />
              </div>
            </Field>

            <Field label="Departure Time">
              <div className="rounded-2xl border border-border h-11 transition-colors bg-muted/30 hover:bg-muted/40 overflow-visible flex items-center pr-1.5">
                <TimePicker
                  value={getTimeFromDateString(form.departureDate) || "Date Only"}
                  onChange={(time) => {
                    const updated = combineDateAndTime(
                      form.departureDate,
                      time === "Date Only" ? "12:00" : time,
                    );
                    set("departureDate", updated);
                  }}
                  label="Select Departure Time"
                  className="rounded-2xl h-11 w-full bg-transparent border-none"
                  glassPopover={false}
                  openOnHover={false}
                />
                {getTimeFromDateString(form.departureDate) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full flex-shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = combineDateAndTime(form.departureDate, "");
                      set("departureDate", updated);
                    }}
                    title="Remove time (keep date only)"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </Field>
          </div>

          {form.travellType === "Return" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Return Date">
                <div className="rounded-2xl border border-border h-11 transition-colors bg-muted/30 hover:bg-muted/40 overflow-visible flex items-center">
                  <DatePicker
                    date={
                      form.returnDate ? new Date(form.returnDate) : undefined
                    }
                    setDate={(d) => {
                      if (!d) {
                        set("returnDate", "");
                        return;
                      }
                      const currentTime = getTimeFromDateString(
                        form.returnDate,
                      );
                      const updated = combineDateAndTime(
                        d.toISOString(),
                        currentTime,
                      );
                      set("returnDate", updated);
                    }}
                    label="Select Return Date"
                    className="rounded-2xl h-11 w-full bg-transparent"
                    glassPopover={false}
                    openOnHover={false}
                    toYear={new Date().getFullYear() + 2}
                    disablePastDates={true}
                  />
                </div>
              </Field>

              <Field label="Return Time">
                <div className="rounded-2xl border border-border h-11 transition-colors bg-muted/30 hover:bg-muted/40 overflow-visible flex items-center pr-1.5">
                  <TimePicker
                    value={getTimeFromDateString(form.returnDate) || "Date Only"}
                    onChange={(time) => {
                      const updated = combineDateAndTime(
                        form.returnDate,
                        time === "Date Only" ? "12:00" : time,
                      );
                      set("returnDate", updated);
                    }}
                    label="Select Return Time"
                    className="rounded-2xl h-11 w-full bg-transparent border-none"
                    glassPopover={false}
                    openOnHover={false}
                  />
                  {getTimeFromDateString(form.returnDate) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full flex-shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = combineDateAndTime(form.returnDate, "");
                        set("returnDate", updated);
                      }}
                      title="Remove time (keep date only)"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </Field>
            </div>
          )}
        </div>
      </div>

      {/* Selected Flight Preview (visible if flightId is present) */}
      {Boolean(form.flightId) && (
        <div className="flex flex-col gap-4 mt-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 px-1">
            <Plane className="h-4 w-4 text-primary" /> Selected Flight
          </h3>
          <div className="relative">
            {previewFlight ? (
              <FlightCard flight={previewFlight} previewMode />
            ) : (
              <div className="rounded-2xl border border-border p-6 text-center text-foreground text-xs bg-muted/10">
                Flight details could not be previewed.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border sticky bottom-0 z-10 bg-card/90 backdrop-blur-md pb-2">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !canSubmit}
          className="rounded-2xl h-11 px-6 font-semibold shadow-sm bg-redmix hover:opacity-90 text-white transition-all min-w-[150px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isEdit ? (
            <Pencil className="h-4 w-4 mr-1.5" />
          ) : (
            <Plus className="h-4 w-4 mr-1.5" />
          )}
          {isEdit ? "Save Changes" : "Create Cheap Bid"}
        </Button>
      </div>
    </div>
  );
}

function CheapBidEditDialog({
  offerId,
  open,
  onOpenChange,
}: {
  offerId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [editForm, setEditForm] = useState<CreateCheapBidDto>(
    buildEmptyCheapBidForm(),
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cheap-bid-edit", offerId],
    queryFn: () => getCheapBid(offerId!),
    enabled: open && offerId != null,
  });

  useEffect(() => {
    if (data) {
      setEditForm(offerToForm(data));
    }
  }, [data]);

  const updateOfferMutation = useMutation({
    mutationFn: (body: UpdateCheapBidDto) => updateCheapBid(offerId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cheap-bids"] });
      queryClient.refetchQueries({ queryKey: ["cheap-bids"] });
      queryClient.invalidateQueries({ queryKey: ["cheap-bid-edit", offerId] });
      queryClient.invalidateQueries({
        queryKey: ["cheap-bid-preview", offerId],
      });
      onOpenChange(false);
      router.refresh();
    },
    onError: (err: Error) => {
      window.alert(err.message || "Failed to update cheap bid.");
    },
  });

  const handleSubmit = () => {
    if (offerId == null) return;
    updateOfferMutation.mutate(buildCheapBidPayload(editForm));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl rounded-3xl border border-border bg-card/95 backdrop-blur-xl p-6 shadow-2xl overflow-hidden"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-radix-popover-content]")) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-radix-popover-content]")) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Pencil className="h-5 w-5 text-primary" /> Edit Cheap Bid Offer
            {offerId != null && (
              <span className="text-foreground font-mono text-sm">
                #{offerId}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-foreground">
            Could not load offer details.
          </div>
        ) : (
          <AddCheapBidForm
            form={editForm}
            onChange={setEditForm}
            onSubmit={handleSubmit}
            isLoading={updateOfferMutation.isPending}
            mode="edit"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CheapBidPreviewDialog({
  offerId,
  open,
  onOpenChange,
}: {
  offerId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cheap-bid-preview", offerId],
    queryFn: () => getCheapBid(offerId!),
    enabled: open && offerId != null,
  });

  const flight = data ? cheapBidOfferToFlightListItem(data) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card/95 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Cheap Bid Preview
            {offerId != null && (
              <span className="text-foreground font-mono text-sm">
                #{offerId}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-foreground -mt-2 mb-2">
          Same card layout customers see on search results (read-only preview).
        </p>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError || !flight ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-foreground">
            Could not load offer details. Add outbound segments to preview the
            flight card.
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <FlightCard flight={flight} previewMode />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
}

const computeLayoverWithCity = async (
  previous: CheapBidSegmentDto,
  current: CheapBidSegmentDto,
): Promise<string> => {
  if (!previous.arriveDateTime || !current.departDateTime || !previous.arrive) {
    return "";
  }
  const arr = new Date(previous.arriveDateTime);
  const dep = new Date(current.departDateTime);
  if (
    isNaN(arr.getTime()) ||
    isNaN(dep.getTime()) ||
    dep.getTime() <= arr.getTime()
  ) {
    return "";
  }
  const mins = Math.round((dep.getTime() - arr.getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const dur = h > 0 ? `${h}h ${m}m` : `${m}m`;
  const airport = previous.arrive.toUpperCase();
  const airportData = await getAirportByCode(airport);
  const city = airportData
    ? airportData.municipality || airportData.name.split(" ")[0]
    : airport;
  return `${dur} layover in ${city} (${airport})`;
};

async function flightToCheapBidForm(
  flight: any,
  searchedOrigin?: string,
  searchedDestination?: string,
): Promise<CreateCheapBidDto> {
  const today = startOfDay(new Date());
  const expiry = addDays(today, 7);

  const mapSegment = (
    seg: any,
    direction: "outbound" | "inbound",
    index: number,
  ): CheapBidSegmentDto => {
    return {
      direction,
      legOrder: index + 1,
      stopTime: "",
      airlineCode: seg.airline?.code || "",
      airlineNameNumber: `${seg.airline?.code || ""}-${seg.flightNo || ""}`,
      depart: seg.fromAirport?.code || "",
      arrive: seg.toAirport?.code || "",
      departDateTime: seg.departureDate,
      arriveDateTime: seg.arrivalDate,
      totalTime: seg.elapsedTime || seg.totalTime || "",
    };
  };

  const outboundSegments = (flight.outbound || []).map(
    (seg: any, idx: number) => mapSegment(seg, "outbound", idx),
  );
  const inboundSegments = (flight.inbound || []).map((seg: any, idx: number) =>
    mapSegment(seg, "inbound", idx),
  );

  const segments = [...outboundSegments, ...inboundSegments];

  for (let i = 1; i < segments.length; i++) {
    if (segments[i].direction === segments[i - 1].direction) {
      const computed = await computeLayoverWithCity(
        segments[i - 1],
        segments[i],
      );
      if (computed) {
        segments[i].stopTime = computed;
      }
    }
  }

  const fare = flight.flightFare;
  let adt = 0;
  let chd = 0;
  let inf = 0;

  const { getConvertedAmount } = useCurrencyStore.getState();
  const flightCurrency = flight.currency || "USD";

  if (fare) {
    const rawAdtTotal = fare.adultFare || 0;
    const rawChdTotal = fare.childFare || 0;
    const rawInfTotal = fare.infantFare || 0;

    const adtConv = getConvertedAmount(rawAdtTotal, flightCurrency, "USD");
    const chdConv = getConvertedAmount(rawChdTotal, flightCurrency, "USD");
    const infConv = getConvertedAmount(rawInfTotal, flightCurrency, "USD");

    adt = Number(adtConv.toFixed(2));
    chd = Number((chdConv > 0 ? chdConv : adtConv).toFixed(2));
    inf = Number((infConv > 0 ? infConv : 0).toFixed(2));
  } else {
    const rawTotal = flight.totalCost || 0;
    const totalConv = getConvertedAmount(rawTotal, flightCurrency, "USD");
    adt = Number(totalConv.toFixed(2));
    chd = Number(totalConv.toFixed(2));
    inf = 0;
  }

  return {
    source: "Ezeeflight US",
    originFrom: searchedOrigin || flight.outbound?.[0]?.fromAirport?.code || "",
    destinationTo:
      searchedDestination ||
      flight.outbound?.[flight.outbound.length - 1]?.toAirport?.code ||
      "",
    airLine: flight.airline?.code || flight.outbound?.[0]?.airline?.code || "",
    travellType: inboundSegments.length > 0 ? "Return" : "OneWay",
    cabin: flight.outbound?.[0]?.cabinClass || "Economy",
    departureDate:
      flight.outbound?.[0]?.departureDate || new Date().toISOString(),
    returnDate:
      inboundSegments.length > 0
        ? flight.inbound?.[0]?.departureDate
        : undefined,
    bidAdtPrice: adt,
    bidChdPrice: chd,
    bidInfPrice: inf,
    originalAdtPrice: adt,
    originalChdPrice: chd,
    originalInfPrice: inf,
    currency: "USD",
    linkExpiryDate: expiry.toISOString(),
    segments,
    flightId: flight.flightId,
  };
}

export function AdminCheapBid() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoadingStore();
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<CreateCheapBidDto>(blankForm());
  const [previewOfferId, setPreviewOfferId] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editOfferId, setEditOfferId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const statusQuery = useQuery({
    queryKey: ["cheap-bid-status"],
    queryFn: getCheapBidStatus,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateCheapBidStatus(status),
    onMutate: () => {
      startLoading("Updating Cheap Bid status...", true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cheap-bid-status"] });
    },
    onSettled: () => {
      stopLoading();
    },
  });

  const currentStatus = statusQuery.data?.status ?? "Stop";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefillRaw = localStorage.getItem("prefill_cheap_bid");
      if (prefillRaw) {
        try {
          const flight = JSON.parse(prefillRaw);
          localStorage.removeItem("prefill_cheap_bid");
          flightToCheapBidForm(flight).then((mappedForm) => {
            setAddForm(mappedForm);
            setIsAddOpen(true);
          });
        } catch (e) {
          console.error("Failed to parse cheap bid prefill", e);
        }
      }
    }
  }, []);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["cheap-bids", page],
    queryFn: () => listCheapBids(page, LIMIT),
    placeholderData: (prev) => prev,
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    if (!isLoading && !isFetching && rows.length === 0 && page > 1) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [rows.length, isLoading, isFetching, page]);

  const createMutation = useMutation({
    mutationFn: (body: CreateCheapBidDto) => createCheapBid(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cheap-bids"] });
      queryClient.refetchQueries({ queryKey: ["cheap-bids"] });
      setIsAddOpen(false);
      setAddForm(blankForm());
      router.refresh();
    },
  });

  const openEdit = (id: number) => {
    setEditOfferId(id);
    setIsEditOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCheapBid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cheap-bids"] });
      queryClient.refetchQueries({ queryKey: ["cheap-bids"] });
      router.refresh();
    },
  });

  const deleteBulkMutation = useMutation({
    mutationFn: (ids: number[]) => deleteBulkCheapBids(ids),
    onMutate: () => {
      startLoading("Deleting selected cheap bids...", true);
    },
    onSuccess: (res) => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["cheap-bids"] });
      queryClient.refetchQueries({ queryKey: ["cheap-bids"] });
      router.refresh();
      toast({
        title: "Selected Bids Deleted",
        description: `Successfully deleted ${res.deleted} offer(s).`,
      });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Bulk Delete Failed",
        description: err.message || "Could not delete selected bids.",
      });
    },
    onSettled: () => {
      stopLoading();
    },
  });

  const isAllSelected =
    rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const isIndeterminate =
    !isAllSelected && rows.some((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        rows.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        rows.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const toggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteAllMutation = useMutation({
    mutationFn: () => deleteAllCheapBids(),
    onMutate: () => {
      startLoading("Deleting all cheap bids...", true);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cheap-bids"] });
      queryClient.refetchQueries({ queryKey: ["cheap-bids"] });
      setPage(1);
      router.refresh();
      toast({
        title: "All Cheap Bids Deleted",
        description: `Successfully deleted ${res.deleted} offer(s).`,
      });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Delete All Failed",
        description: err.message || "Could not delete all cheap bids.",
      });
    },
    onSettled: () => {
      stopLoading();
    },
  });

  const openPreview = (id: number) => {
    setPreviewOfferId(id);
    setIsPreviewOpen(true);
  };

  const handleCreateSubmit = () => {
    createMutation.mutate(buildCheapBidPayload(addForm));
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      startLoading("Uploading and processing Excel sheet...", true);
      const res = await uploadCheapBids(file);
      const descParts: string[] = [];
      if (res.count > 0) {
        descParts.push(`Successfully imported/updated ${res.count} cheap bids.`);
      }
      if (res.skippedCount > 0) {
        descParts.push(`${res.skippedCount} exact duplicate(s) skipped.`);
      }
      if (res.errors && res.errors.length > 0) {
        descParts.push(`${res.errors.length} row(s) had errors.`);
      }
      toast({
        title: "Excel Import Complete",
        description: descParts.join(" ") || "No records changed.",
      });
      queryClient.invalidateQueries({ queryKey: ["cheap-bids"] });
      queryClient.refetchQueries({ queryKey: ["cheap-bids"] });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Excel Import Failed",
        description: err.message || "Failed to upload Excel file",
      });
    } finally {
      setIsUploading(false);
      stopLoading();
      e.target.value = "";
    }
  };

  const tableActions = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 mr-3 bg-muted/40 border border-border px-3.5 py-1.5 rounded-2xl shadow-sm h-9">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider">
          Cheap Bid Status:
        </span>
        <span
          className={cn(
            "text-xs font-bold transition-all",
            currentStatus === "Start" ? "text-emerald-500" : "text-amber-500",
          )}
        >
          {currentStatus === "Start" ? "Running" : "Stopped"}
        </span>
        <Switch
          id="cheap-bid-status-switch"
          checked={currentStatus === "Start"}
          onCheckedChange={(checked) => {
            statusMutation.mutate(checked ? "Start" : "Stop");
          }}
          disabled={statusQuery.isLoading || statusMutation.isPending}
          className="scale-90"
        />
      </div>

      <label
        className={cn(
          "rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary dark:text-white text-xs font-semibold px-4 h-9 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all select-none disabled:opacity-50",
          isUploading && "pointer-events-none opacity-50",
        )}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span>Upload Excel</span>
        <input
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          onChange={handleExcelUpload}
          disabled={isUploading}
        />
      </label>

      {/* Delete Selected dark:text-white button — only shown when rows are checked */}
      {selectedIds.size > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              disabled={deleteBulkMutation.isPending}
              className="rounded-2xl h-9 px-4 text-xs font-semibold text-destructive dark:text-white hover:text-destructive hover:bg-destructive/10 border border-destructive/20 gap-1.5 transition-all animate-in fade-in slide-in-from-right-2 duration-150"
            >
              {deleteBulkMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Selected ({selectedIds.size})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {selectedIds.size} Cheap Bid(s)?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the{" "}
                <strong>{selectedIds.size}</strong> selected offer(s). This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteBulkMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteBulkMutation.mutate(Array.from(selectedIds))
                }
                disabled={deleteBulkMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-1.5"
              >
                {deleteBulkMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Yes, Delete {selectedIds.size}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete All button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            disabled={deleteAllMutation.isPending || total === 0}
            className="rounded-2xl h-9 px-4 text-xs font-semibold text-destructive dark:text-white hover:text-destructive hover:bg-destructive/10 border border-destructive/20 gap-1.5 transition-all"
          >
            {deleteAllMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete All
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ALL Cheap Bids?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all <strong>{total}</strong> cheap
              bid offer(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAllMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAllMutation.mutate()}
              disabled={deleteAllMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-1.5"
            >
              {deleteAllMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Yes, Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <CheapBidPreviewDialog
        offerId={previewOfferId}
        open={isPreviewOpen}
        onOpenChange={(open) => {
          setIsPreviewOpen(open);
          if (!open) setPreviewOfferId(null);
        }}
      />
      <CheapBidEditDialog
        offerId={editOfferId}
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditOfferId(null);
        }}
      />
      <PullToRefresh onRefresh={handleRefresh}>
        <AdminDataTable
          title="Cheap Bid Offers"
          subtitle="Cheap Bid: 24 hours limited price offers"
          totalCount={total}
          totalLabel="Total bids"
          isLoading={isLoading}
          headers={[
            "ID",
            "Source",
            "Route",
            "Airline",
            "Timings",
            "Bid Price (Adt/Chd/Inf)",
            "Expiry Date",
            "Status",
            "Action",
          ]}
          actions={tableActions}
          onCheckAll={toggleSelectAll}
          isAllChecked={isAllSelected || isIndeterminate}
          hasRows={rows.length > 0}
          pagination={{
            page,
            totalPages,
            onPageChange: setPage,
            isFetching,
          }}
        >
          {rows.map((row) => {
            const isActive = row.status === "active";
            const isExpired =
              row.status === "expired" ||
              (row.linkExpiryDate && new Date(row.linkExpiryDate) < new Date());

            const outboundSegments =
              row.segments?.filter((s) => s.direction === "outbound") || [];
            const outboundArrival =
              outboundSegments.length > 0
                ? [...outboundSegments].sort(
                    (a, b) => b.legOrder - a.legOrder,
                  )[0].arriveDateTime
                : undefined;

            const inboundSegments =
              row.segments?.filter((s) => s.direction === "inbound") || [];
            const inboundArrival =
              inboundSegments.length > 0
                ? [...inboundSegments].sort(
                    (a, b) => b.legOrder - a.legOrder,
                  )[0].arriveDateTime
                : undefined;

            const isRowSelected = selectedIds.has(row.id);

            return (
              <tr
                key={row.id}
                className={cn(
                  "border-t border-border/60 hover:bg-muted/30 transition-colors",
                  isRowSelected && "bg-primary/5",
                )}
              >
                {/* Checkbox cell */}
                <td className="px-2 py-3 text-center w-8">
                  <Checkbox
                    checked={isRowSelected}
                    onCheckedChange={() => toggleRow(row.id)}
                    variant="ios"
                    className="mx-auto"
                  />
                </td>
                <td className="px-3 py-3 font-mono text-xs font-semibold text-foreground">
                  #{row.id}
                </td>
                <td className="px-3 py-3 text-sm font-medium whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/60 border border-border/60 text-foreground">
                    {row.source || "Ezeeflight US"}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm font-bold whitespace-nowrap">
                  <div className="flex items-center gap-1 text-foreground">
                    <span className="text-primary dark:text-red-400">
                      {row.originFrom}
                    </span>
                    <AirportCity code={row.originFrom || ""} />
                    <Plane className="h-3.5 w-3.5 text-muted-foreground mx-1 flex-shrink-0" />
                    <span className="text-primary dark:text-red-400">
                      {row.destinationTo}
                    </span>
                    <AirportCity code={row.destinationTo || ""} />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground capitalize">
                    {row.travellType || "Return"} • {row.cabin || "Economy"}
                    {" "}•{" "}
                    {row.stops === 0
                      ? "Direct"
                      : row.stops === 1
                        ? "1 Stop max"
                        : row.stops === 2
                          ? "2 Stops max"
                          : "Any Stops"}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm font-semibold text-foreground">
                  {row.airLine || "Any"}
                </td>
                <td className="px-3 py-3 text-xs text-foreground whitespace-nowrap">
                  <div className="flex flex-col gap-1.5 leading-normal">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-none">
                        Outbound Timings
                      </span>
                      <div className="flex flex-col gap-0.5 mt-1 font-medium">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-foreground">
                            Dep:
                          </span>
                          <span>{formatDateTime(row.departureDate)}</span>
                        </div>
                        {outboundArrival && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-semibold text-foreground">
                              Arr:
                            </span>
                            <span>{formatDateTime(outboundArrival)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {row.returnDate && (
                      <div className="flex flex-col border-t border-border/40 pt-1 mt-0.5">
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-none">
                          Inbound Timings
                        </span>
                        <div className="flex flex-col gap-0.5 mt-1 font-medium">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-semibold text-foreground">
                              Dep:
                            </span>
                            <span>{formatDateTime(row.returnDate)}</span>
                          </div>
                          {inboundArrival && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-semibold text-foreground">
                                Arr:
                              </span>
                              <span>{formatDateTime(inboundArrival)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    {/* Adult bid price */}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="text-foreground text-[11px] font-semibold">Adt:</span>
                      {row.bidAdtPrice == null ? (
                        <span className="text-foreground italic font-semibold text-[11px]">
                          live price
                        </span>
                      ) : row.discountType === "percentage" ? (
                        <span>{row.bidAdtPrice}%</span>
                      ) : (
                        <span>${row.bidAdtPrice}</span>
                      )}
                    </span>
                    {/* Child bid price — null = real-time */}
                    <span className="text-[11px] text-foreground flex items-center gap-1">
                      <span className="text-foreground font-semibold">Chd:</span>
                      {row.bidChdPrice == null ? (
                        <span className="text-foreground italic font-semibold">
                          — live price
                        </span>
                      ) : row.discountType === "percentage" ? (
                        <span>{row.bidChdPrice}%</span>
                      ) : (
                        <span>${row.bidChdPrice}</span>
                      )}
                    </span>
                    {/* Infant bid price — null = real-time */}
                    <span className="text-[11px] text-foreground flex items-center gap-1">
                      <span className="text-foreground font-semibold">Inf:</span>
                      {row.bidInfPrice == null ? (
                        <span className="text-foreground italic font-semibold">
                          — live price
                        </span>
                      ) : row.discountType === "percentage" ? (
                        <span>{row.bidInfPrice}%</span>
                      ) : (
                        <span>${row.bidInfPrice}</span>
                      )}
                    </span>
                    <span className="inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary dark:bg-red-500/10 dark:text-red-400 w-fit uppercase">
                      {row.discountType || "replace"}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-3 text-xs whitespace-nowrap">
                  <span
                    className={cn(
                      "font-medium",
                      isExpired ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {formatDateTime(row.linkExpiryDate)}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize",
                      isActive && !isExpired
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : row.status === "booked"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted text-foreground border border-border",
                    )}
                  >
                    {isExpired && isActive ? "expired" : row.status}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPreview(row.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-2xl h-8 px-3 text-xs font-medium gap-1.5 shadow-2xs hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      View
                    </Button> */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(row.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-2xl h-8 px-3 text-xs font-medium gap-1.5 shadow-2xs hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5 text-primary" />
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={deleteMutation.isPending}
                          className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl font-medium flex items-center"
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables === row.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Cheap Bid?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete Cheap
                            Bid #{row.id}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            disabled={deleteMutation.isPending}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              deleteMutation.mutate(row.id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center"
                          >
                            {deleteMutation.isPending &&
                            deleteMutation.variables === row.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminDataTable>
      </PullToRefresh>
    </div>
  );
}

export function FlightSearchCheapBidModal({
  flight,
  open,
  onOpenChange,
  onBidCreated,
  searchedOrigin,
  searchedDestination,
}: {
  flight: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBidCreated?: (data: any) => void;
  searchedOrigin?: string;
  searchedDestination?: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const [addForm, setAddForm] = useState<CreateCheapBidDto>(blankForm());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && flight) {
      setIsLoading(true);
      flightToCheapBidForm(flight, searchedOrigin, searchedDestination).then(
        (form) => {
          setAddForm(form);
          setIsLoading(false);
        },
      );
    } else {
      setAddForm(blankForm());
    }
  }, [open, flight, searchedOrigin, searchedDestination]);

  const createMutation = useMutation({
    mutationFn: (body: CreateCheapBidDto) => createCheapBid(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cheap-bids"] });
      queryClient.refetchQueries({ queryKey: ["cheap-bids"] });
      onOpenChange(false);
      setAddForm(blankForm());
      startLoading("Refetching latest flight prices & bid data...");
      if (onBidCreated) {
        onBidCreated(data);
      } else {
        router.refresh();
        setTimeout(() => stopLoading(), 1200);
      }
    },
  });

  const handleCreateSubmit = () => {
    createMutation.mutate(buildCheapBidPayload(addForm));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl rounded-3xl border border-border bg-card/95 backdrop-blur-xl p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-radix-popover-content]")) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-radix-popover-content]")) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Tag className="h-5 w-5 text-primary" /> Create Cheap Bid Offer
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-foreground" />
          </div>
        ) : (
          <AddCheapBidForm
            form={addForm}
            onChange={setAddForm}
            onSubmit={handleCreateSubmit}
            isLoading={createMutation.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
