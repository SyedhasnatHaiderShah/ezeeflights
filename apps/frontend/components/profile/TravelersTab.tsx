"use client";

import React, { useState } from "react";
import { parseISO, format, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TravelerList, type Traveler } from "./TravelerList";
import type { AddTravelerDto } from "@/lib/api/profile";
import { toast } from "@/lib/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function TravelersTab({
  travelers,
  onAdd,
  onDelete,
}: {
  travelers: Traveler[];
  onAdd: (payload: AddTravelerDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    passportNumber: "",
    dob: "",
    nationality: "",
    gender: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!form.firstName || !form.lastName || !form.passportNumber) {
      setError(t("Please fill in first name, last name, and passport number."));
      return;
    }
    setAddLoading(true);
    setError("");
    try {
      const fullName = [form.firstName, form.middleName, form.lastName]
        .filter(Boolean)
        .map((n) => n.trim())
        .join(" ");

      await onAdd({
        fullName,
        passportNumber: form.passportNumber,
        dob: form.dob,
        nationality: form.nationality,
        gender: form.gender,
      } as any);

      toast({
        variant: "success",
        title: t("Traveler Added"),
        description: t("{{name}} has been successfully added.", { name: fullName }),
      });

      setForm({
        firstName: "",
        middleName: "",
        lastName: "",
        passportNumber: "",
        dob: "",
        nationality: "",
        gender: "",
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to add traveler"));
      toast({
        variant: "destructive",
        title: t("Error"),
        description: err instanceof Error ? err.message : t("Failed to add traveler."),
      });
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("My Travelers")}</h3>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError("");
          }}
          className="rounded-lg bg-redmix px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-red-light active:scale-95"
        >
          {showAddForm ? t("Cancel") : t("Add Traveler")}
        </button>
      </div>

      {showAddForm && (
        <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
          <h4 className="text-md font-bold text-foreground">
            {t("Add New Traveler")}
          </h4>
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("First Name")}
              </Label>
              <Input
                placeholder={t("First name")}
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Middle Name")}
              </Label>
              <Input
                placeholder={t("Middle name")}
                value={form.middleName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, middleName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Last Name")}
              </Label>
              <Input
                placeholder={t("Last name")}
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Passport Number")}
              </Label>
              <Input
                placeholder={t("Passport Number")}
                value={form.passportNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, passportNumber: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Date of Birth")}
              </Label>
              <div className="h-11 rounded-xl border border-input bg-background transition-all hover:border-primary/50">
                <DatePicker
                  label=""
                  date={
                    form.dob && isValid(parseISO(form.dob))
                      ? parseISO(form.dob)
                      : undefined
                  }
                  setDate={(d) =>
                    setForm((p) => ({
                      ...p,
                      dob: d ? format(d, "yyyy-MM-dd") : "",
                    }))
                  }
                  openOnHover={false}
                  className="h-full px-4"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  captionLayout="dropdown"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Nationality")}
              </Label>
              <Input
                placeholder={t("Nationality")}
                value={form.nationality}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nationality: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Gender")}
              </Label>
              <Select
                value={form.gender}
                onValueChange={(val) => setForm((p) => ({ ...p, gender: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select gender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">{t("Male")}</SelectItem>
                  <SelectItem value="FEMALE">{t("Female")}</SelectItem>
                  <SelectItem value="OTHER">{t("Other")}</SelectItem>
                  <SelectItem value="UNSPECIFIED">{t("Prefer not to say")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={addLoading}
              className="rounded-lg bg-redmix px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-red/20 transition-all hover:bg-brand-red-light active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {addLoading ? t("Saving...") : t("Save Traveler")}
            </button>
          </div>
        </div>
      )}

      {travelers.length === 0 && !showAddForm && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("No saved travelers yet.")}
          </p>
        </div>
      )}

      <TravelerList travelers={travelers} onDelete={onDelete} />
    </div>
  );
}
