"use client";

import { useEffect, useState } from "react";
import { parseISO, format, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

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

  useEffect(() => {
    setForm(initial ?? {});
  }, [initial]);

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
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Gender
          </Label>
          <Select
            value={form.gender ?? ""}
            onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Male</SelectItem>
              <SelectItem value="F">Female</SelectItem>
            </SelectContent>
          </Select>
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
