"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { TravelPreferences } from "@/lib/api/profile";
import { useTranslation } from "react-i18next";

const notificationOptions = [
  ["email", "Email"],
  ["sms", "SMS"],
  ["whatsapp", "WhatsApp"],
  ["push", "Push"],
] as const;

export function NotificationPreferencesForm({
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

  const setNotificationPreference = (key: string, checked: boolean) => {
    setPreferences((current) => ({
      ...current,
      notificationPreferences: {
        ...(current.notificationPreferences ?? {}),
        [key]: checked,
      },
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
        err instanceof Error ? err.message : t("Failed to save notifications"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-md bg-card p-4 sm:p-5">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {t("Notification Preferences")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("Select your preferred notification channels.")}
        </p>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-500">{error}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {notificationOptions.map(([key, label]) => (
          <label
            key={key}
            className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-4 py-3 text-sm transition-all hover:border-brand-red/20"
          >
            <span className="font-medium text-foreground">{t(label)}</span>
            <Switch
              checked={Boolean(preferences.notificationPreferences?.[key])}
              onCheckedChange={(checked) =>
                setNotificationPreference(key, checked)
              }
            />
          </label>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          className="rounded-lg bg-redmix px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-red/20 transition-all hover:bg-brand-red-light active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={submit}
          disabled={loading}
        >
          {loading ? t("Saving...") : t("Save notifications")}
        </button>
      </div>
    </div>
  );
}
