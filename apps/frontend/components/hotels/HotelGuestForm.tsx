"use client";

import { useState } from "react";
import {
  User,
  Calendar,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import * as Label from "@radix-ui/react-label";
import {
  isHotelGuestComplete,
} from "@/lib/validation/hotel-guest";
import { getContactValidationError } from "@/lib/validation/flight-traveler";
import { BookingContactForm } from "@/components/flights/BookingContactForm";
import { useTranslation } from "react-i18next";

interface Props {
  roomIds: string[];
  contactEmail: string;
  contactPhone: string;
  onContactEmailChange: (email: string) => void;
  onContactPhoneChange: (phone: string) => void;
  onSubmit: (
    guests: Array<{
      firstName: string;
      middleName?: string;
      lastName: string;
      age: number;
      type: "ADULT" | "CHILD";
      roomId: string;
    }>,
  ) => void;
  isSubmitting?: boolean;
}

type GuestRow = {
  firstName: string;
  middleName: string;
  lastName: string;
  age: number | string;
  type: "ADULT" | "CHILD";
  roomId: string;
};

function emptyGuest(roomId: string): GuestRow {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    type: "ADULT",
    roomId,
  };
}

export function HotelGuestForm({
  roomIds,
  contactEmail,
  contactPhone,
  onContactEmailChange,
  onContactPhoneChange,
  onSubmit,
  isSubmitting,
}: Props) {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const defaultRoomId = roomIds[0] ?? "";

  const [guests, setGuests] = useState<GuestRow[]>([emptyGuest(defaultRoomId)]);

  const addGuest = () => {
    setGuests((prev) => [...prev, emptyGuest(defaultRoomId)]);
  };

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      setGuests((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateGuest = (index: number, field: keyof GuestRow, value: string) => {
    setGuests((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "age") {
        const ageNum = parseInt(value, 10);
        if (!Number.isNaN(ageNum)) {
          next[index].type = ageNum >= 18 ? "ADULT" : "CHILD";
        }
      }
      return next;
    });
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();

        const incomplete = guests.some((g) => !isHotelGuestComplete(g));
        if (incomplete) {
          setFormError(
            t("Please complete First Name, Last Name, and Age for every guest."),
          );
          return;
        }

        const contactResult = getContactValidationError(
          contactEmail,
          contactPhone,
        );
        if (!contactResult.valid) {
          setFormError(contactResult.description ?? contactResult.title ?? null);
          return;
        }

        setFormError(null);
        onSubmit(
          guests.map((g) => ({
            firstName: g.firstName.trim(),
            middleName: g.middleName.trim() || undefined,
            lastName: g.lastName.trim(),
            age: Number(g.age),
            type: g.type,
            roomId: g.roomId || defaultRoomId,
          })),
        );
      }}
    >
      {formError && (
        <p className="text-sm font-medium text-red-500 px-1">{formError}</p>
      )}
      <div className="space-y-4">
        {guests.map((guest, index) => (
          <div
            key={index}
            className="group relative p-3 md:p-5 rounded-2xl border border-border/60 bg-muted/20 transition-all hover:border-redmix/30 hover:bg-redmix/5 hover:shadow-md animate-in fade-in slide-in-from-left-4 duration-500"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-redmix/10 text-redmix flex items-center justify-center text-xs shrink-0">
                  {index + 1}
                </span>
                {t("Guest Details")}
              </h4>
              {guests.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGuest(index)}
                  className="p-2.5 text-foreground/70 hover:text-redmix hover:bg-redmix/10 rounded-xl transition-all cursor-pointer"
                  aria-label={t("Remove guest")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label.Root
                  htmlFor={`firstName-${index}`}
                  className="text-xs font-bold text-foreground/80 tracking-wider ml-1"
                >
                  {t("First Name")} <span className="text-redmix">*</span>
                </Label.Root>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/80/50 z-10" />
                  <input
                    id={`firstName-${index}`}
                    required
                    className="w-full h-[50px] bg-muted/20 border border-border/50 rounded-2xl pl-11 pr-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-redmix/20 focus-visible:border-redmix focus-visible:bg-background outline-none transition-all"
                    placeholder={t("First name")}
                    value={guest.firstName}
                    onChange={(e) =>
                      updateGuest(index, "firstName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label.Root
                  htmlFor={`middleName-${index}`}
                  className="text-xs font-bold text-foreground/80 tracking-wider ml-1"
                >
                  {t("Middle Name")}
                </Label.Root>
                <input
                  id={`middleName-${index}`}
                  className="w-full h-[50px] bg-muted/20 border border-border/50 rounded-2xl px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-redmix/20 focus-visible:border-redmix focus-visible:bg-background outline-none transition-all"
                  placeholder={t("Middle name (optional)")}
                  value={guest.middleName}
                  onChange={(e) =>
                    updateGuest(index, "middleName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label.Root
                  htmlFor={`lastName-${index}`}
                  className="text-xs font-bold text-foreground/80 tracking-wider ml-1"
                >
                  {t("Last Name")} <span className="text-redmix">*</span>
                </Label.Root>
                <input
                  id={`lastName-${index}`}
                  required
                  className="w-full h-[50px] bg-muted/20 border border-border/50 rounded-2xl px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-redmix/20 focus-visible:border-redmix focus-visible:bg-background outline-none transition-all"
                  placeholder={t("Last name")}
                  value={guest.lastName}
                  onChange={(e) =>
                    updateGuest(index, "lastName", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4 max-w-md">
              <div className="space-y-2">
                <Label.Root
                  htmlFor={`age-${index}`}
                  className="text-xs font-bold text-foreground/80 tracking-wider ml-1"
                >
                  {t("Age")} <span className="text-redmix">*</span>
                </Label.Root>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/80/50 z-10" />
                  <input
                    id={`age-${index}`}
                    required
                    type="number"
                    min={0}
                    max={120}
                    className="w-full h-[50px] bg-muted/20 border border-border/50 rounded-2xl pl-11 pr-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-redmix/20 focus-visible:border-redmix focus-visible:bg-background outline-none transition-all"
                    placeholder={t("Age")}
                    value={guest.age}
                    onChange={(e) => updateGuest(index, "age", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BookingContactForm
        email={contactEmail}
        phone={contactPhone}
        onEmailChange={onContactEmailChange}
        onPhoneChange={onContactPhoneChange}
        disabled={isSubmitting}
        description={t(
          "We'll use these details to confirm your reservation and send your booking confirmation.",
        )}
      />

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          type="button"
          onClick={addGuest}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-border text-foreground/80 font-bold text-sm hover:border-redmix/30 hover:text-redmix hover:bg-redmix/[0.02] transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" /> {t("Add Another Guest")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-[1.5] flex items-center justify-center gap-2 bg-redmix text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-redmix/20 hover:shadow-redmix/30 transition-all hover:scale-[1.01] active:scale-[0.98] group disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("Securing Your Stay...")}
            </>
          ) : (
            <>
              {t("Confirm Booking")}{" "}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
