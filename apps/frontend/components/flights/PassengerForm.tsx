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

interface Passenger {
  fullName: string;
  passportNumber: string;
  dob: string;
  gender: "M" | "F";
  seatNumber: string;
  type: "ADULT" | "CHILD" | "INFANT";
}

export function PassengerForm({
  passengers,
  setPassengers,
}: {
  passengers: Passenger[];
  setPassengers: (p: Passenger[]) => void;
}) {
  const updatePassenger = (
    index: number,
    field: keyof Passenger,
    value: string,
  ) => {
    setPassengers(
      passengers.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
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
                Traveler Information
              </h3>
              <Badge
                variant="outline"
                size="sm"
                className="bg-muted/50 border-none"
              >
                {passenger.type}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    className="pl-9 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50"
                    placeholder="As shown on passport"
                    value={passenger.fullName}
                    onChange={(e) =>
                      updatePassenger(index, "fullName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Passport Number
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    className="pl-9 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50"
                    placeholder="Passport ID"
                    value={passenger.passportNumber}
                    onChange={(e) =>
                      updatePassenger(index, "passportNumber", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Category
                </Label>
                <Select
                  value={passenger.type}
                  onValueChange={(v) =>
                    updatePassenger(index, "type", v as any)
                  }
                >
                  <SelectTrigger className="h-11 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50 rounded-xl">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADULT">Adult (12+)</SelectItem>
                    <SelectItem value="CHILD">Child (2-11)</SelectItem>
                    <SelectItem value="INFANT">Infant (Under 2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Date of Birth
                </Label>
                <div className="h-11 w-full rounded-xl border border-border bg-background/50 overflow-hidden hover:border-redmix/50 transition-all focus-within:ring-1 focus-within:ring-redmix/10 focus-within:border-redmix/50">
                  <DatePicker
                    date={
                      passenger.dob
                        ? parse(passenger.dob, "yyyy-MM-dd", new Date())
                        : undefined
                    }
                    setDate={(date) =>
                      updatePassenger(
                        index,
                        "dob",
                        date ? format(date, "yyyy-MM-dd") : "",
                      )
                    }
                    label=""
                    className="h-full px-3"
                    openOnHover={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Gender
                </Label>
                <Select
                  value={passenger.gender}
                  onValueChange={(v) =>
                    updatePassenger(index, "gender", v as any)
                  }
                >
                  <SelectTrigger className="h-11 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50 rounded-xl">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Seat Preference (Optional)
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    className="pl-9 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50"
                    placeholder="e.g. 14A"
                    value={passenger.seatNumber}
                    onChange={(e) =>
                      updatePassenger(
                        index,
                        "seatNumber",
                        e.target.value.toUpperCase(),
                      )
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
