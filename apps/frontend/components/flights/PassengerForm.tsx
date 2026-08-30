"use client";

import { User, CreditCard, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parse } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface Passenger {
  fullName: string;
  passportNumber: string;
  phoneNumber?: string;
  gender: "M" | "F";
  type: "ADULT" | "CHILD" | "INFANT";
}

export function PassengerForm({
  passengers,
  setPassengers,
}: {
  passengers: Passenger[];
  setPassengers: (p: Passenger[]) => void;
}) {
  const { t } = useTranslation();
  const typeLabelMap: Record<Passenger["type"], string> = {
    ADULT: "Adult",
    CHILD: "Child",
    INFANT: "Infant",
  };
  const updatePassenger = (
    index: number,
    field: keyof Passenger,
    value: string,
  ) => {
    setPassengers(
      passengers.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const isTypeSelectionDisabled = (index: number, targetType: Passenger["type"]) => {
    const p = passengers[index];
    if (p.type === targetType) return false;

    const adultsCount = passengers.filter(p => p.type === "ADULT").length;
    const infantsCount = passengers.filter(p => p.type === "INFANT").length;

    let nextAdults = adultsCount;
    let nextInfants = infantsCount;

    if (p.type === "ADULT") nextAdults--;
    if (targetType === "ADULT") nextAdults++;

    if (p.type === "INFANT") nextInfants--;
    if (targetType === "INFANT") nextInfants++;

    return nextInfants > nextAdults;
  };

  return (
    <div className="grid gap-4">
      {passengers.map((passenger, index) => (
        <Card
          key={index}
          className="overflow-hidden rounded-2xl border-border bg-card shadow-md transition-all hover:border-redmix/30"
        >
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-redmix/10 text-redmix text-sm font-black">
                  0{index + 1}
                </span>
                {t("Traveler Information")}
              </h3>
              <Badge
                variant="outline"
                size="sm"
                className="bg-muted/50 border-none"
              >
                {t(typeLabelMap[passenger.type])}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  {t("Full Name")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    className="pl-9 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50"
                    placeholder={t("As shown on passport")}
                    value={passenger.fullName}
                    onChange={(e) =>
                      updatePassenger(index, "fullName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  {t("Passport Number")}
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    className="pl-9 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50"
                    placeholder={t("Passport ID")}
                    value={passenger.passportNumber}
                    onChange={(e) =>
                      updatePassenger(index, "passportNumber", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  {t("Category")}
                </Label>
                <Select
                  value={passenger.type}
                  onValueChange={(v) =>
                    updatePassenger(index, "type", v as any)
                  }
                >
                  <SelectTrigger className="h-11 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50 rounded-xl">
                    <SelectValue placeholder={t("Select Category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADULT" disabled={isTypeSelectionDisabled(index, "ADULT")}>{t("Adult (12+)")}</SelectItem>
                    <SelectItem value="CHILD" disabled={isTypeSelectionDisabled(index, "CHILD")}>{t("Child (2-11)")}</SelectItem>
                    <SelectItem value="INFANT" disabled={isTypeSelectionDisabled(index, "INFANT")}>{t("Infant (Under 2)")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  {t("Gender")}
                </Label>
                <Select
                  value={passenger.gender}
                  onValueChange={(v) =>
                    updatePassenger(index, "gender", v as any)
                  }
                >
                  <SelectTrigger className="h-11 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50 rounded-xl">
                    <SelectValue placeholder={t("Select Gender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">{t("Male")}</SelectItem>
                    <SelectItem value="F">{t("Female")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  {t("Phone Number")}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    className="pl-9 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50"
                    placeholder={t("e.g. +1234567890")}
                    value={passenger.phoneNumber || ""}
                    onChange={(e) =>
                      updatePassenger(index, "phoneNumber", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
