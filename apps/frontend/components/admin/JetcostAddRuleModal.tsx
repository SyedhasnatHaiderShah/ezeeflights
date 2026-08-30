"use client";

import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUsaMarkup,
  CreateUsaMarkupDto,
  UsaMarkupRow,
} from "@/lib/api/admin-api";
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
} from "@/components/ui/dialog";
import { LocationInput } from "@/components/ui/location-input";
import { AirlineInput } from "@/components/ui/airline-input";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/lib/hooks/use-toast";
import { addDays, format, isValid, parse, startOfDay, isBefore } from "date-fns";
import { Loader2 } from "lucide-react";
import { useCurrencyStore } from "@/lib/store/currency-store";

export const MARKUP_TYPES = ["percentage", "fixed", "replace", "Discount"] as const;
export const CABIN_CLASSES = ["Economy", "Premium Economy", "Business", "First", "All"] as const;
export const JOURNEY_TYPES = ["Return", "OneWay"] as const;

export const IOS_INPUT =
  "rounded-2xl border border-border bg-muted/30 h-11 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-primary/30";
export const IOS_SELECT = "rounded-2xl border border-border bg-muted/30 h-11 text-sm shadow-sm";

export function formatMarkupDate(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, "MM/dd/yyyy");
}

export function parseMarkupDate(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, "MM/dd/yyyy", new Date());
  return isValid(parsed) ? parsed : undefined;
}

export const blankJetcostForm = (): CreateUsaMarkupDto => {
  const today = startOfDay(new Date());
  const end = addDays(today, 7);
  return {
    source: "",
    destination: "",
    airline: "",
    startDate: formatMarkupDate(today),
    endDate: formatMarkupDate(end),
    markupType: "fixed",
    cabinClass: "Economy",
    journeyType: "Return",
    adultAmount: 0,
    childAmount: 0,
    infantAmount: 0,
    userId: null,
    userName: null,
  };
};

export function flightToJetcostForm(flight: any): CreateUsaMarkupDto {
  if (!flight) return blankJetcostForm();

  const firstLeg = flight.outbound?.[0];
  const lastLeg = flight.outbound?.[flight.outbound.length - 1] || firstLeg;

  const source = firstLeg?.fromAirport?.code || "";
  const destination = lastLeg?.toAirport?.code || "";
  const airline = flight.airline?.code || firstLeg?.airline?.code || "";

  const startIso = firstLeg?.departureDate;
  const startDateDate = startIso ? new Date(startIso) : new Date();
  const startDate = formatMarkupDate(
    isValid(startDateDate) ? startDateDate : new Date(),
  );

  const retIso = flight.inbound?.[0]?.departureDate;
  const retDateDate = retIso
    ? new Date(retIso)
    : addDays(isValid(startDateDate) ? startDateDate : new Date(), 7);
  const endDate = formatMarkupDate(
    isValid(retDateDate) ? retDateDate : addDays(new Date(), 7),
  );

  const journeyType =
    flight.inbound && flight.inbound.length > 0 ? "Return" : "OneWay";
  const cabinClass = flight.cabinClass || "Economy";

  const fare = flight.flightFare;
  let adultAmount = 0;
  let childAmount = 0;
  let infantAmount = 0;

  const { getConvertedAmount } = useCurrencyStore.getState();
  const flightCurrency = flight.currency || "USD";

  if (fare) {
    const rawAdtTotal = fare.adultFare ?? fare.adultTotal ?? fare.adult ?? 0;
    const rawChdTotal = fare.childFare ?? fare.childTotal ?? fare.child ?? 0;
    const rawInfTotal = fare.infantFare ?? fare.infantTotal ?? fare.infant ?? 0;

    const adtConv = getConvertedAmount(rawAdtTotal, flightCurrency, "USD");
    const chdConv = getConvertedAmount(rawChdTotal, flightCurrency, "USD");
    const infConv = getConvertedAmount(rawInfTotal, flightCurrency, "USD");

    adultAmount = Number(adtConv.toFixed(2));
    childAmount = Number((chdConv > 0 ? chdConv : 0).toFixed(2));
    infantAmount = Number((infConv > 0 ? infConv : 0).toFixed(2));
  } else if (flight.totalCost) {
    const rawTotal = flight.totalCost || 0;
    const totalConv = getConvertedAmount(rawTotal, flightCurrency, "USD");
    adultAmount = Number(totalConv.toFixed(2));
    childAmount = Number(totalConv.toFixed(2));
    infantAmount = 0;
  }

  return {
    ...blankJetcostForm(),
    source,
    destination,
    airline,
    startDate,
    endDate,
    markupType: "fixed",
    cabinClass,
    journeyType,
    adultAmount,
    childAmount,
    infantAmount,
  };
}

export function parseAmountInput(raw: string): number {
  if (raw === "" || raw === "-") return 0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
}

export function AmountInput({
  value,
  onChange,
  className,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState(value === 0 ? "" : String(value));
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (isFocusedRef.current) return;
    setText(value === 0 ? "" : String(value));
  }, [value]);

  const handleChange = (raw: string) => {
    if (raw !== "" && raw !== "-" && !/^-?\d*$/.test(raw)) return;
    setText(raw);
    if (raw === "" || raw === "-") return;
    onChange(parseAmountInput(raw));
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (text === "" || text === "-") {
      setText("");
      onChange(0);
      return;
    }
    const num = parseAmountInput(text);
    setText(num === 0 ? "" : String(num));
    onChange(num);
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      className={className}
      value={text}
      placeholder="0"
      disabled={disabled}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      onFocus={() => {
        isFocusedRef.current = true;
        if (value === 0) setText("");
      }}
    />
  );
}

export function LocationField({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label}>
      <div className="rounded-2xl border border-border h-12 transition-colors bg-muted/30 overflow-visible">
        <LocationInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="rounded-2xl h-12 bg-transparent hover:bg-muted/40"
          glassPopover={false}
          openOnHover={false}
          shimmer={false}
        />
      </div>
    </Field>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function AddRuleForm({
  form,
  onChange,
  onSubmit,
  isLoading,
  isPrefilled = false,
}: {
  form: CreateUsaMarkupDto;
  onChange: (f: CreateUsaMarkupDto) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isPrefilled?: boolean;
}) {
  const set = (key: keyof CreateUsaMarkupDto, value: any) =>
    onChange({ ...form, [key]: value });

  const markupHint: Record<string, string> = {
    fixed: "Deducts a fixed $ amount from the base fare",
    percentage: "Deducts a % of the base fare",
    replace: "Replaces the base fare with this exact amount",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 overflow-visible">
      {isPrefilled ? (
        <div className="col-span-full rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-1 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-primary/15 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              Target Flight Pattern
            </span>
            <span className="text-[11px] font-semibold text-foreground bg-background/90 px-3 py-0.5 rounded-full border border-border shadow-2xs">
              {form.journeyType} • {form.cabinClass}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Route</p>
              <p className="font-bold text-foreground mt-0.5 text-base">
                {form.source || "Any"} → {form.destination || "Any"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Airline</p>
              <p className="font-bold text-foreground mt-0.5 truncate text-base">
                {form.airline || "All Airlines"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Start Date</p>
              <p className="font-semibold text-foreground mt-0.5">{form.startDate || "Any"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">End Date</p>
              <p className="font-semibold text-foreground mt-0.5">{form.endDate || "Any"}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <LocationField
            label="Source (Origin)"
            value={form.source}
            onChange={(val) => set("source", val)}
            placeholder="From Where?"
          />
          <LocationField
            label="Destination"
            value={form.destination}
            onChange={(val) => set("destination", val)}
            placeholder="To Where?"
          />
          <Field label="Airline">
            <div className="rounded-2xl border border-border h-12 transition-colors bg-muted/30 overflow-visible">
              <AirlineInput
                value={form.airline}
                onChange={(code) => set("airline", code)}
                placeholder="Select airline"
                allowAny
                className="h-12 rounded-2xl"
              />
            </div>
          </Field>
          <Field label="Start Date">
            <div className="rounded-2xl border border-border h-12 transition-colors bg-muted/30 overflow-visible">
              <DatePicker
                date={parseMarkupDate(form.startDate)}
                setDate={(d) => {
                  const nextStart = formatMarkupDate(d);
                  const end = parseMarkupDate(form.endDate);
                  if (d && end && isBefore(end, d)) {
                    onChange({ ...form, startDate: nextStart, endDate: nextStart });
                  } else {
                    set("startDate", nextStart);
                  }
                }}
                label="Start Date"
                className="rounded-2xl h-12"
                glassPopover={false}
                openOnHover={false}
                toYear={new Date().getFullYear() + 5}
              />
            </div>
          </Field>
          <Field label="End Date">
            <div className="rounded-2xl border border-border h-12 transition-colors bg-muted/30 overflow-visible">
              <DatePicker
                date={parseMarkupDate(form.endDate)}
                setDate={(d) => set("endDate", formatMarkupDate(d))}
                label="End Date"
                className="rounded-2xl h-12"
                glassPopover={false}
                openOnHover={false}
                toYear={new Date().getFullYear() + 5}
                calendarDisabled={(date: Date) => {
                  const start = parseMarkupDate(form.startDate);
                  return start
                    ? isBefore(startOfDay(date), startOfDay(start))
                    : false;
                }}
              />
            </div>
          </Field>
          <Field label="Cabin Class">
            <Select
              value={form.cabinClass}
              onValueChange={(v) => set("cabinClass", v)}
            >
              <SelectTrigger className={IOS_SELECT}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CABIN_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Journey Type">
            <Select
              value={form.journeyType}
              onValueChange={(v) => set("journeyType", v)}
            >
              <SelectTrigger className={IOS_SELECT}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOURNEY_TYPES.map((j) => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </>
      )}

      <Field label="Markup Type">
        <Select
          value={form.markupType}
          onValueChange={(v) => set("markupType", v)}
        >
          <SelectTrigger className={IOS_SELECT}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MARKUP_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {markupHint[form.markupType]}
        </p>
      </Field>
      <Field label="Adult Amount">
        <AmountInput
          className={IOS_INPUT}
          value={form.adultAmount}
          onChange={(n) => set("adultAmount", n)}
        />
      </Field>
      <Field label="Child Amount">
        <AmountInput
          className={IOS_INPUT}
          value={form.childAmount}
          onChange={(n) => set("childAmount", n)}
        />
      </Field>
      <Field label="Infant Amount">
        <AmountInput
          className={IOS_INPUT}
          value={form.infantAmount}
          onChange={(n) => set("infantAmount", n)}
        />
      </Field>
      <Field label="User Name (optional)">
        <Input
          className={IOS_INPUT}
          value={form.userName ?? ""}
          onChange={(e) => set("userName", e.target.value || null)}
        />
      </Field>

      <div className="col-span-full flex flex-col items-end gap-1.5 pt-2">
        {isPrefilled &&
          form.adultAmount === 0 &&
          form.childAmount === 0 &&
          form.infantAmount === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Please enter markup/discount amount before saving prefilled rule.
            </p>
          )}
        <div className="flex justify-end gap-2 w-full">
          <Button
            onClick={onSubmit}
            disabled={
              isLoading ||
              (isPrefilled &&
                form.adultAmount === 0 &&
                form.childAmount === 0 &&
                form.infantAmount === 0)
            }
            className="rounded-2xl h-11 px-6 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Save Rule
          </Button>
        </div>
      </div>
    </div>
  );
}

export function JetcostAddRuleModal({
  isOpen,
  onOpenChange,
  initialForm,
  isPrefilled = false,
  onSuccess,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialForm?: CreateUsaMarkupDto;
  isPrefilled?: boolean;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addForm, setAddForm] = useState<CreateUsaMarkupDto>(
    initialForm || blankJetcostForm(),
  );

  useEffect(() => {
    if (isOpen) {
      setAddForm(initialForm || blankJetcostForm());
    }
  }, [isOpen, initialForm]);

  const createMutation = useMutation({
    mutationFn: (body: CreateUsaMarkupDto) => createUsaMarkup(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usa-markup"] });
      toast({
        title: "Rule Created",
        description: "Spanish Jetcost markup rule added successfully.",
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to save Spanish Jetcost rule.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl rounded-3xl border border-border bg-card/95 backdrop-blur-xl p-6 shadow-xl overflow-visible"
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
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Add Spanish Jetcost Markup Rule
          </DialogTitle>
        </DialogHeader>
        <AddRuleForm
          form={addForm}
          onChange={setAddForm}
          onSubmit={() =>
            createMutation.mutate({
              ...addForm,
              source: addForm.source.trim().toUpperCase(),
              destination: addForm.destination.trim().toUpperCase(),
              airline: addForm.airline.trim().toUpperCase(),
              adultAmount: Math.abs(addForm.adultAmount),
              childAmount: Math.abs(addForm.childAmount),
              infantAmount: Math.abs(addForm.infantAmount),
            })
          }
          isLoading={createMutation.isPending}
          isPrefilled={isPrefilled}
        />
      </DialogContent>
    </Dialog>
  );
}
