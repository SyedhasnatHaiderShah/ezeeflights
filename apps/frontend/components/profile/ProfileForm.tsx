"use client";

import { useEffect, useMemo, useState } from "react";
import { parseISO, format, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhoneWithDialCodeInput } from "@/components/shared/PhoneWithDialCodeInput";
import { normalizePhoneInput } from "@/lib/phone";
import { NATIONALITIES } from "@/lib/nationalities.generated";
import type { UpdateProfileDto } from "@/lib/api/profile";
import { useTranslation } from "react-i18next";
import { useToast } from "@/lib/hooks/use-toast";

type ProfilePayload = UpdateProfileDto;

export function ProfileForm({
  initial,
  onSave,
}: {
  initial?: ProfilePayload;
  onSave: (payload: ProfilePayload) => Promise<void>;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState<ProfilePayload>(initial ?? {});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Lock phone once it is already saved — changing it can violate the unique constraint
  const phoneIsLocked = !!initial?.phone?.trim();

  const [nationalityOpen, setNationalityOpen] = useState(false);
  const [nationalitySearch, setNationalitySearch] = useState("");

  useEffect(() => {
    if (!initial) {
      setForm({});
      return;
    }
    setForm({
      ...initial,
      phone: initial.phone ? normalizePhoneInput(initial.phone) : initial.phone,
    });
  }, [initial]);

  const birthDate = useMemo(() => {
    return form.dateOfBirth && isValid(parseISO(form.dateOfBirth))
      ? parseISO(form.dateOfBirth)
      : undefined;
  }, [form.dateOfBirth]);

  const selectedNationality = useMemo(() => {
    if (!form.nationality) return null;
    return NATIONALITIES.find(
      (n) =>
        n.nationality.toLowerCase() === form.nationality?.toLowerCase() ||
        n.name.toLowerCase() === form.nationality?.toLowerCase() ||
        n.alpha2.toLowerCase() === form.nationality?.toLowerCase() ||
        n.alpha3.toLowerCase() === form.nationality?.toLowerCase(),
    );
  }, [form.nationality]);

  async function submit() {
    if (loading) return;
    try {
      setLoading(true);
      setError("");
      await onSave(form);
      toast({ title: t("Saved"), description: t("Your profile has been updated."), variant: "success" });
    } catch (err) {
      // Try to extract a readable message from the backend JSON error
      let message = t("Failed to save profile");
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          message = Array.isArray(parsed.message)
            ? parsed.message[0]
            : (parsed.message ?? message);
        } catch {
          message = err.message || message;
        }
      }
      setError(message);
      toast({ title: t("Error"), description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 rounded-2xl border bg-card p-5 sm:p-6 lg:p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          {t("Personal Information")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Update your personal details and how we can reach you.")}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-950/30">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t("First Name")}
          </Label>
          <Input
            className="h-12 rounded-xl bg-background/50 border-border/60 transition-colors focus:bg-background"
            placeholder={t("First name")}
            value={form.firstName ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, firstName: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t("Middle Name")}
          </Label>
          <Input
            className="h-12 rounded-xl bg-background/50 border-border/60 transition-colors focus:bg-background"
            placeholder={t("Middle name")}
            value={form.middleName ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, middleName: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t("Last Name")}
          </Label>
          <Input
            className="h-12 rounded-xl bg-background/50 border-border/60 transition-colors focus:bg-background"
            placeholder={t("Last name")}
            value={form.lastName ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, lastName: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t("Phone Number")}
          </Label>
          <PhoneWithDialCodeInput
            value={form.phone ?? ""}
            onChange={(phone) => setForm((p) => ({ ...p, phone }))}
            disabled={phoneIsLocked}
          />
          {phoneIsLocked && (
            <p className="text-[13px] text-muted-foreground">
              {t("Contact support to change your phone number.")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t("Nationality")}
          </Label>
          <Popover open={nationalityOpen} onOpenChange={setNationalityOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl flex items-center justify-between px-4 border-border/60 bg-background/50 hover:bg-background text-foreground select-none font-normal"
              >
                <span className="flex items-center gap-2 truncate">
                  {selectedNationality ? (
                    <>
                      <span>{selectedNationality.flag}</span>
                      <span>{selectedNationality.nationality}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      {form.nationality || t("Select nationality")}
                    </span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[300px] p-0 rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-md z-[9999]"
              align="start"
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder={t("Search nationality...")}
                  value={nationalitySearch}
                  onChange={(e) => setNationalitySearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground text-foreground"
                />
              </div>
              <div className="max-h-[250px] overflow-y-auto p-1 text-sm">
                {NATIONALITIES.filter(
                  (n) =>
                    n.name
                      .toLowerCase()
                      .includes(nationalitySearch.toLowerCase()) ||
                    n.nationality
                      .toLowerCase()
                      .includes(nationalitySearch.toLowerCase()) ||
                    n.alpha2
                      .toLowerCase()
                      .includes(nationalitySearch.toLowerCase()) ||
                    n.alpha3
                      .toLowerCase()
                      .includes(nationalitySearch.toLowerCase()),
                ).map((n, idx) => {
                  const isSelected =
                    n.nationality.toLowerCase() ===
                    form.nationality?.toLowerCase();
                  return (
                    <div
                      key={`${n.alpha2}-${idx}`}
                      onClick={() => {
                        setForm((p) => ({ ...p, nationality: n.nationality }));
                        setNationalityOpen(false);
                        setNationalitySearch("");
                      }}
                      className={cn(
                        "flex items-center justify-between p-2.5 cursor-pointer rounded-lg hover:bg-muted select-none transition-colors",
                        isSelected && "bg-muted font-bold",
                      )}
                    >
                      <span className="flex items-center gap-2 truncate flex-1">
                        <span>{n.flag}</span>
                        <span className="truncate font-medium">
                          {n.nationality} ({n.name})
                        </span>
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-redmix shrink-0" />
                      )}
                    </div>
                  );
                })}
                {NATIONALITIES.filter(
                  (n) =>
                    n.name
                      .toLowerCase()
                      .includes(nationalitySearch.toLowerCase()) ||
                    n.nationality
                      .toLowerCase()
                      .includes(nationalitySearch.toLowerCase()),
                ).length === 0 && (
                  <div className="p-3 text-center text-xs text-muted-foreground select-none">
                    {t("No results found.")}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {/* <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Passport Number")}
          </Label>
          <Input
            placeholder={t("Passport Number")}
            value={form.passportNumber ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, passportNumber: e.target.value }))
            }
          />
        </div> */}

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t("Date of Birth")}
          </Label>
          <div className="h-12 rounded-xl border border-border/60 bg-background/50 transition-colors hover:bg-background hover:border-primary/50">
            <DatePicker
              label=""
              date={birthDate}
              setDate={(d) =>
                setForm((p) => ({
                  ...p,
                  dateOfBirth: d ? format(d, "yyyy-MM-dd") : "",
                }))
              }
              openOnHover={false}
              className="h-full px-4"
              fromYear={1980}
              toYear={new Date().getFullYear()}
              captionLayout="dropdown"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {t("Gender")}
          </Label>
          <Select
            value={form.gender ?? ""}
            onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
          >
            <SelectTrigger className="h-12 rounded-xl border border-border/60 bg-background/50 hover:bg-background px-4 text-sm outline-none transition-colors focus:border-primary/50">
              <SelectValue placeholder={t("Select gender")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">{t("Male")}</SelectItem>
              <SelectItem value="FEMALE">{t("Female")}</SelectItem>
              <SelectItem value="OTHER">{t("Other")}</SelectItem>
              <SelectItem value="UNSPECIFIED">
                {t("Prefer not to say")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-6 border-t border-border/40">
        <button
          className="w-full sm:w-auto rounded-xl bg-redmix px-10 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-redmix/90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={submit}
          disabled={loading}
        >
          {loading ? t("Saving...") : t("Save Changes")}
        </button>
      </div>
    </div>
  );
}
