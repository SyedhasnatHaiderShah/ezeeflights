"use client";

import { useState } from "react";

type ProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  preferences?: Record<string, unknown>;
};

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
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            First Name
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
            placeholder="First name"
            value={form.firstName ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, firstName: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Last Name
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
            placeholder="Last name"
            value={form.lastName ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, lastName: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Phone Number
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
            placeholder="Phone"
            value={form.phone ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nationality
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
            placeholder="Nationality"
            value={form.nationality ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, nationality: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Passport Number
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
            placeholder="Passport Number"
            value={form.passportNumber ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, passportNumber: e.target.value }))
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
          {loading ? "Saving..." : "Save profile"}
        </button>
      </div>
    </div>
  );
}
