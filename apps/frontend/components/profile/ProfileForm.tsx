"use client";

import { useEffect, useState } from "react";
import { parseISO, format, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import type { UpdateProfileDto, TravelPreferences } from "@/lib/api/profile";

type ProfilePayload = UpdateProfileDto;

const notificationOptions = [
  ["email", "Email"],
  ["sms", "SMS"],
  ["whatsapp", "WhatsApp"],
  ["push", "Push"],
] as const;

export function ProfileForm({
  initial,
  onSave,
}: {
  initial?: ProfilePayload;
  onSave: (payload: ProfilePayload) => Promise<void>;
}) {
  const [form, setForm] = useState<ProfilePayload>(initial ?? {});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initial ?? {});
  }, [initial]);

  const preferences = form.preferences ?? {};

  const setPreference = (updates: Partial<TravelPreferences>) => {
    setForm((current) => ({
      ...current,
      preferences: {
        ...(current.preferences ?? {}),
        ...updates,
      },
    }));
  };

  async function submit() {
    if (loading) return;
    try {
      setLoading(true);
      setError("");
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-md bg-card p-4 sm:p-5">
      <h2 className="text-xl font-bold text-foreground">
        Personal Information
      </h2>
      {error ? (
        <p className="text-sm font-medium text-red-500">{error}</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            First Name
          </Label>
          <Input
            placeholder="First name"
            value={form.firstName ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, firstName: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Last Name
          </Label>
          <Input
            placeholder="Last name"
            value={form.lastName ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, lastName: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Phone Number
          </Label>
          <Input
            placeholder="Phone"
            value={form.phone ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nationality
          </Label>
          <Input
            placeholder="Nationality"
            value={form.nationality ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, nationality: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Passport Number
          </Label>
          <Input
            placeholder="Passport Number"
            value={form.passportNumber ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, passportNumber: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Passport Expiry
          </Label>
          <Input
            type="date"
            value={form.passportExpiry ? (form.passportExpiry.includes("T") ? form.passportExpiry.split("T")[0] : form.passportExpiry) : ""}
            onChange={(e) => setForm((p) => ({ ...p, passportExpiry: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Date of Birth
          </Label>
          <div className="h-11 rounded-xl border border-input bg-background transition-all hover:border-primary/50">
            <DatePicker
              label=""
              date={
                form.dateOfBirth && isValid(parseISO(form.dateOfBirth))
                  ? parseISO(form.dateOfBirth)
                  : undefined
              }
              setDate={(d) =>
                setForm((p) => ({
                  ...p,
                  dateOfBirth: d ? format(d, "yyyy-MM-dd") : "",
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
            Gender
          </Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:border-primary/50"
            value={form.gender ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="UNSPECIFIED">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Travel Preferences</h3>
          <p className="text-sm text-muted-foreground">Set defaults for booking, accessibility, and notifications.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Seat Preference</Label>
            <select
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:border-primary/50"
              value={preferences.seatPreference ?? ""}
              onChange={(e) => setPreference({ seatPreference: e.target.value })}
            >
              <option value="">Choose seat</option>
              <option value="WINDOW">Window</option>
              <option value="AISLE">Aisle</option>
              <option value="MIDDLE">Middle</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meal Preference</Label>
            <select
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:border-primary/50"
              value={preferences.mealPreference ?? ""}
              onChange={(e) => setPreference({ mealPreference: e.target.value })}
            >
              <option value="">Choose meal</option>
              <option value="VEG">Vegetarian</option>
              <option value="NON_VEG">Non-vegetarian</option>
              <option value="VEGAN">Vegan</option>
              <option value="HALAL">Halal</option>
              <option value="KOSHER">Kosher</option>
              <option value="GLUTEN_FREE">Gluten free</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cabin Class</Label>
            <select
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:border-primary/50"
              value={preferences.cabinClass ?? ""}
              onChange={(e) => setPreference({ cabinClass: e.target.value })}
            >
              <option value="">Choose cabin</option>
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Language</Label>
            <Input
              placeholder="e.g. English"
              value={preferences.language ?? ""}
              onChange={(e) => setPreference({ language: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Currency</Label>
            <select
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:border-primary/50"
              value={preferences.currency ?? ""}
              onChange={(e) => setPreference({ currency: e.target.value })}
            >
              <option value="">Choose currency</option>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accessibility Needs</Label>
            <Input
              placeholder="Wheelchair, assistance dog, priority boarding"
              value={(preferences.accessibilityNeeds ?? []).join(", ")}
              onChange={(e) =>
                setPreference({
                  accessibilityNeeds: e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {notificationOptions.map(([key, label]) => (
            <label key={key} className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-4 py-3 text-sm">
              <span className="font-medium text-foreground">{label}</span>
              <Switch
                checked={Boolean(preferences.notificationPreferences?.[key])}
                onCheckedChange={(checked) =>
                  setPreference({
                    notificationPreferences: {
                      ...(preferences.notificationPreferences ?? {}),
                      [key]: checked,
                    },
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          className="rounded-lg bg-redmix px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-red/20 transition-all hover:bg-brand-red-light active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </div>
    </div>
  );
}
