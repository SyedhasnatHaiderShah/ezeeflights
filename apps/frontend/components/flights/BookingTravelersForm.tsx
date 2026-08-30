"use client";

import { Baby, User, UserCircle, AlertCircle, Trash2 } from "lucide-react";
import { parseISO, format, isValid } from "date-fns";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { BufferedInput } from "./BufferedInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InquiryTraveler } from "@/lib/api/inquiries";
import { NationalitySelect } from "@/components/shared/NationalitySelect";
import { useTranslation } from "react-i18next";
import {
  getSlotAgeHint,
  getSlotLabel,
  validateDobForSlot,
  type TravelerSlot,
  type PassengerCategory,
} from "@/lib/validation/flight-passenger";
import { emptyTraveler } from "@/lib/dev/mock-travelers";

const GROUP_SURFACE =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50 shadow-sm";

const FIELD_LABEL = "text-[12px] font-semibold text-foreground/80";

const INPUT_CLASS =
  "h-10 rounded-[10px] border-border/50 bg-white text-[13px] font-medium text-foreground dark:bg-card dark:border-white/20 dark:hover:border-white/40 dark:focus-visible:ring-white";

const TYPE_ICONS: Record<PassengerCategory, typeof UserCircle> = {
  adult: UserCircle,
  child: User,
  infant: Baby,
};

const TYPE_BADGE_CLASS: Record<PassengerCategory, string> = {
  adult: "bg-redmix/5 dark:bg-foreground text-redmix",
  child: "bg-redmix/5 dark:bg-foreground text-redmix",
  infant: "bg-redmix/5 dark:bg-foreground text-redmix",
};

interface BookingTravelersFormProps {
  travelers: InquiryTraveler[];
  onChange: (travelers: InquiryTraveler[]) => void;
  disabled?: boolean;
  /** When set, one form per slot with Adult/Child/Infant labels; add/remove hidden. */
  travelerSlots?: TravelerSlot[];
  /** Departure date for age-at-travel checks (yyyy-MM-dd). */
  departDate?: string | null;
  /** Called when DOB implies a different passenger type than the slot. */
  onDobTypeMismatch?: (
    globalIndex: number,
    slot: TravelerSlot,
    classified: PassengerCategory,
  ) => void;
  /** Called when the user clicks the delete button on a traveler card. */
  onRemoveSlot?: (globalIndex: number, slot: TravelerSlot) => void;
  showErrors?: boolean;
}

export function BookingTravelersForm({
  travelers,
  onChange,
  disabled = false,
  travelerSlots,
  departDate,
  onDobTypeMismatch,
  onRemoveSlot,
  showErrors = false,
}: BookingTravelersFormProps) {
  const { t } = useTranslation();
  const fixedSlots = travelerSlots && travelerSlots.length > 0;
  const slotsToRender: TravelerSlot[] = fixedSlots
    ? travelerSlots!
    : travelers.map((_, i) => ({
        type: "adult" as const,
        indexInType: i + 1,
        globalIndex: i,
      }));

  function update(index: number, patch: Partial<InquiryTraveler>) {
    const next = travelers.map((tVal, i) =>
      i === index ? { ...tVal, ...patch } : tVal,
    );
    onChange(next);
  }

  function handleDobChange(
    globalIndex: number,
    slot: TravelerSlot,
    dob: string,
  ) {
    update(globalIndex, { dob });
    if (!dob?.trim() || !onDobTypeMismatch) return;
    const check = validateDobForSlot(dob, slot.type, departDate);
    if (!check.valid && check.classified && check.classified !== slot.type) {
      onDobTypeMismatch(globalIndex, slot, check.classified);
    }
  }

  return (
    <div className="space-y-3">
      {slotsToRender.map((slot) => {
        const idx = slot.globalIndex;
        const traveler = travelers[idx] ?? emptyTraveler(slot);
        const Icon = TYPE_ICONS[slot.type];
        const dobCheck = traveler.dob
          ? validateDobForSlot(traveler.dob, slot.type, departDate)
          : null;

        const isFirstNameInvalid = showErrors && !traveler.firstName?.trim();
        const isLastNameInvalid = showErrors && !traveler.lastName?.trim();
        const isDobInvalid = showErrors && (!traveler.dob?.trim() || (dobCheck && !dobCheck.valid));
        const isGenderInvalid = showErrors && !traveler.gender;

        const referenceDate = departDate ? new Date(departDate) : new Date();
        const currentYear = referenceDate.getFullYear();

        let fromYear = 1920;
        let toYear = currentYear;
        let calendarDisabled: ((date: Date) => boolean) | undefined = undefined;

        if (slot.type === "adult") {
          fromYear = currentYear - 120;
          toYear = currentYear - 12;
          const maxDob = new Date(
            referenceDate.getFullYear() - 12,
            referenceDate.getMonth(),
            referenceDate.getDate(),
          );
          calendarDisabled = (d: Date) => d > maxDob;
        } else if (slot.type === "child") {
          fromYear = currentYear - 12;
          toYear = currentYear - 2;
          const minDob = new Date(
            referenceDate.getFullYear() - 12,
            referenceDate.getMonth(),
            referenceDate.getDate(),
          );
          const maxDob = new Date(
            referenceDate.getFullYear() - 2,
            referenceDate.getMonth(),
            referenceDate.getDate(),
          );
          calendarDisabled = (d: Date) => d <= minDob || d > maxDob;
        } else if (slot.type === "infant") {
          fromYear = currentYear - 2;
          toYear = currentYear;
          const minDob = new Date(
            referenceDate.getFullYear() - 2,
            referenceDate.getMonth(),
            referenceDate.getDate(),
          );
          calendarDisabled = (d: Date) => d <= minDob || d > referenceDate;
        }

        return (
          <div
            key={`${slot.type}-${slot.indexInType}-${idx}`}
            className={cn(GROUP_SURFACE, "relative space-y-3 p-3 md:p-4")}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-2.5">
                {/* <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/50 bg-redmix/10 text-redmix">
                  <Icon className="h-[18px] w-[18px]" />
                </div> */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-[17px] font-semibold tracking-tight text-foreground">
                      {getSlotLabel(slot, t)}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md border px-1.5 py-0 text-[10px] font-bold",
                        TYPE_BADGE_CLASS[slot.type],
                      )}
                    >
                      {getSlotAgeHint(slot, t)}
                    </Badge>
                  </div>
                  {fixedSlots && (
                    <p className="mt-0.5 text-[11px] font-medium text-foreground/75">
                      {t("Passenger")} #{idx + 1}
                    </p>
                  )}
                </div>
              </div>

              {onRemoveSlot && slotsToRender.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveSlot(idx, slot)}
                  disabled={disabled}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-[10px] border border-border/50 bg-white text-foreground/60 transition-colors hover:border-redmix/30 hover:bg-redmix/5 hover:text-redmix dark:bg-card md:right-4 md:top-4"
                  aria-label={t("Remove traveler")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {dobCheck && !dobCheck.valid && dobCheck.message && (
              <div
                role="alert"
                className="flex gap-2 rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] leading-snug text-amber-900 dark:text-amber-100"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{dobCheck.message}</span>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className={FIELD_LABEL}>
                  {t("First Name")} <span className="text-redmix">*</span>
                </Label>
                <BufferedInput
                  placeholder={t("First name")}
                  value={traveler.firstName}
                  disabled={disabled}
                  onChange={(val) => update(idx, { firstName: val })}
                  className={cn(
                    INPUT_CLASS,
                    isFirstNameInvalid && "border-red-500 focus-visible:ring-red-500/30 dark:border-red-500 focus-within:ring-red-500/30 focus-within:border-red-500 focus:border-red-500"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={FIELD_LABEL}>{t("Middle Name")}</Label>
                <BufferedInput
                  placeholder={t("Middle name (optional)")}
                  value={traveler.middleName ?? ""}
                  disabled={disabled}
                  onChange={(val) => update(idx, { middleName: val })}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={FIELD_LABEL}>
                  {t("Last Name")} <span className="text-redmix">*</span>
                </Label>
                <BufferedInput
                  placeholder={t("Last name")}
                  value={traveler.lastName}
                  disabled={disabled}
                  onChange={(val) => update(idx, { lastName: val })}
                  className={cn(
                    INPUT_CLASS,
                    isLastNameInvalid && "border-red-500 focus-visible:ring-red-500/30 dark:border-red-500 focus-within:ring-red-500/30 focus-within:border-red-500 focus:border-red-500"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={FIELD_LABEL}>
                  {t("Date of Birth")} <span className="text-redmix">*</span>
                </Label>
                <div className={cn(
                  "h-10 rounded-[10px] border border-border/50 bg-white transition-colors hover:border-border dark:bg-card dark:border-white/20 dark:hover:border-white/40",
                  isDobInvalid && "border-red-500 dark:border-red-500 focus-within:ring-red-500/30 focus-within:border-red-500 focus:border-red-500"
                )}>
                  <DatePicker
                    label=""
                    date={
                      traveler.dob && isValid(parseISO(traveler.dob))
                        ? parseISO(traveler.dob)
                        : undefined
                    }
                    setDate={(d) =>
                      handleDobChange(
                        idx,
                        slot,
                        d ? format(d, "yyyy-MM-dd") : "",
                      )
                    }
                    openOnHover={false}
                    className="h-full rounded-[10px] px-3 text-[13px] font-medium"
                    fromYear={fromYear}
                    toYear={toYear}
                    calendarDisabled={calendarDisabled}
                    captionLayout="dropdown"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={FIELD_LABEL}>
                  {t("Nationality")}{" "}
                  <span className="font-normal normal-case text-foreground/60">
                    ({t("optional")})
                  </span>
                </Label>
                <NationalitySelect
                  value={traveler.nationality}
                  disabled={disabled}
                  onChange={(countryName) =>
                    update(idx, { nationality: countryName })
                  }
                  className={INPUT_CLASS}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={FIELD_LABEL}>
                  {t("Gender")} <span className="text-redmix">*</span>
                </Label>
                <Select
                  value={traveler.gender ?? ""}
                  disabled={disabled}
                  onValueChange={(val) => update(idx, { gender: val })}
                >
                  <SelectTrigger className={cn(
                    INPUT_CLASS,
                    isGenderInvalid && "border-red-500 dark:border-red-500 focus:ring-red-500/30 focus:border-red-500"
                  )}>
                    <SelectValue placeholder={t("Select gender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="MALE"
                      className="text-[13px] font-medium"
                    >
                      {t("Male")}
                    </SelectItem>
                    <SelectItem
                      value="FEMALE"
                      className="text-[13px] font-medium"
                    >
                      {t("Female")}
                    </SelectItem>
                    <SelectItem
                      value="OTHER"
                      className="text-[13px] font-medium"
                    >
                      {t("Other")}
                    </SelectItem>
                    <SelectItem
                      value="UNSPECIFIED"
                      className="text-[13px] font-medium"
                    >
                      {t("Prefer not to say")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { emptyTraveler } from "@/lib/dev/mock-travelers";
