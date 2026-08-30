"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export interface SavedGuest {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  type: "ADULT" | "CHILD";
  email?: string;
  phone?: string;
}

export function GuestsTab({
  guests = [],
  onAdd,
  onDelete,
}: {
  guests: SavedGuest[];
  onAdd: (payload: Omit<SavedGuest, "id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const typeLabelMap: Record<"ADULT" | "CHILD", string> = {
    ADULT: t("Adult"),
    CHILD: t("Child"),
  };
  const genderLabelMap: Record<string, string> = {
    MALE: t("Male"),
    FEMALE: t("Female"),
    OTHER: t("Other"),
    UNSPECIFIED: t("Prefer not to say"),
  };
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "UNSPECIFIED",
    type: "ADULT",
    email: "",
    phone: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAgeChange = (val: string) => {
    const ageNum = parseInt(val, 10);
    let resolvedType = form.type;
    if (!isNaN(ageNum)) {
      resolvedType = ageNum >= 18 ? "ADULT" : "CHILD";
    }
    setForm((f) => ({ ...f, age: val, type: resolvedType }));
  };

  async function handleSave() {
    if (!form.fullName.trim() || !form.age) {
      setError(t("Please fill in the full name and age."));
      return;
    }
    const ageVal = parseInt(form.age, 10);
    if (isNaN(ageVal) || ageVal < 0 || ageVal > 120) {
      setError(t("Please enter a valid age between 0 and 120."));
      return;
    }

    setAddLoading(true);
    setError("");
    try {
      await onAdd({
        fullName: form.fullName.trim(),
        age: ageVal,
        gender: form.gender,
        type: form.type as "ADULT" | "CHILD",
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });

      setForm({
        fullName: "",
        age: "",
        gender: "UNSPECIFIED",
        type: "ADULT",
        email: "",
        phone: "",
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to add guest"));
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("My Guests")}</h3>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError("");
          }}
          className="rounded-lg bg-redmix px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-red-light active:scale-95 cursor-pointer"
        >
          {showAddForm ? t("Cancel") : t("Add Guest")}
        </button>
      </div>

      {showAddForm && (
        <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-md font-bold text-foreground">
            {t("Add New Guest")}
          </h4>
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Full Name")}
              </Label>
              <Input
                placeholder={t("Full Legal Name")}
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Age")}
              </Label>
              <Input
                type="number"
                placeholder={t("Age")}
                min={0}
                max={120}
                value={form.age}
                onChange={(e) => handleAgeChange(e.target.value)}
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
                <SelectTrigger className="h-11 rounded-xl border border-input bg-background px-4 text-sm transition-all focus:border-primary/50">
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
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Email Address")}
              </Label>
              <Input
                type="email"
                placeholder={t("guest@example.com")}
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Phone Number")}
              </Label>
              <Input
                placeholder={t("Phone Number")}
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={addLoading}
              className="rounded-lg bg-redmix px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-red/20 transition-all hover:bg-brand-red-light active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {addLoading ? t("Saving...") : t("Save Guest")}
            </button>
          </div>
        </div>
      )}

      {guests.length === 0 && !showAddForm && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("No saved guests yet.")}
          </p>
        </div>
      )}

      {guests.length > 0 && (
        <ul className="space-y-3">
          {guests.map((guest) => (
            <li
              key={guest.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-redmix/10 text-redmix">
                  <span className="text-sm font-bold">
                    {guest.fullName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-foreground">{guest.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("Age")}: {guest.age} • {typeLabelMap[guest.type]} •{" "}
                    {genderLabelMap[guest.gender] ?? guest.gender}
                    {guest.email && ` • ${guest.email}`}
                    {guest.phone && ` • ${guest.phone}`}
                  </p>
                </div>
              </div>
              <button
                className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 cursor-pointer"
                onClick={() => onDelete(guest.id)}
              >
                {t("Delete")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
