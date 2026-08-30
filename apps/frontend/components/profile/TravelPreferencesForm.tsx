"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TravelPreferences } from "@/lib/api/profile";
import { useTranslation } from "react-i18next";

export function TravelPreferencesForm({
  initial,
  onSave,
}: {
  initial?: TravelPreferences;
  onSave: (payload: { preferences: TravelPreferences }) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<TravelPreferences>(
    initial ?? {},
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPreferences(initial ?? {});
  }, [initial]);

  const setPreference = (updates: Partial<TravelPreferences>) => {
    setPreferences((current) => ({
      ...current,
      ...updates,
    }));
  };

  async function submit() {
    if (loading) return;
    try {
      setLoading(true);
      setError("");
      await onSave({ preferences });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("Failed to save preferences"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-md bg-card p-4 sm:p-5">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {t("Travel Preferences")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("Set defaults for booking, accessibility, and seating.")}
        </p>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-500">{error}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Seat Preference")}
          </Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:border-primary/50"
            value={preferences.seatPreference ?? ""}
            onChange={(e) => setPreference({ seatPreference: e.target.value })}
          >
            <option value="">{t("Choose seat")}</option>
            <option value="WINDOW">{t("Window")}</option>
            <option value="AISLE">{t("Aisle")}</option>
            <option value="MIDDLE">{t("Middle")}</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Meal Preference")}
          </Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:border-primary/50"
            value={preferences.mealPreference ?? ""}
            onChange={(e) => setPreference({ mealPreference: e.target.value })}
          >
            <option value="">{t("Choose meal")}</option>
            <option value="VEG">{t("Vegetarian")}</option>
            <option value="NON_VEG">{t("Non-vegetarian")}</option>
            <option value="VEGAN">{t("Vegan")}</option>
            <option value="HALAL">{t("Halal")}</option>
            <option value="KOSHER">{t("Kosher")}</option>
            <option value="GLUTEN_FREE">{t("Gluten free")}</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Cabin Class")}
          </Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:border-primary/50"
            value={preferences.cabinClass ?? ""}
            onChange={(e) => setPreference({ cabinClass: e.target.value })}
          >
            <option value="">{t("Choose cabin")}</option>
            <option value="ECONOMY">{t("Economy")}</option>
            <option value="PREMIUM_ECONOMY">{t("Premium Economy")}</option>
            <option value="BUSINESS">{t("Business")}</option>
            <option value="FIRST">{t("First")}</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Language")}
          </Label>
          <Input
            placeholder={t("e.g. English")}
            value={preferences.language ?? ""}
            onChange={(e) => setPreference({ language: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Currency")}
          </Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:border-primary/50"
            value={preferences.currency ?? ""}
            onChange={(e) => setPreference({ currency: e.target.value })}
          >
            <option value="">{t("Choose currency")}</option>
            <option value="USD">USD</option>
            <option value="AED">AED</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Accessibility Needs")}
          </Label>
          <Input
            placeholder={t("Wheelchair, assistance dog, priority boarding")}
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

      <div className="flex justify-end pt-2">
        <button
          className="rounded-lg bg-redmix px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-red/20 transition-all hover:bg-brand-red-light active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={submit}
          disabled={loading}
        >
          {loading ? t("Saving...") : t("Save preferences")}
        </button>
      </div>
    </div>
  );
}
