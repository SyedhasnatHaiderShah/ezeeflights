"use client";

import { Mail } from "lucide-react";
import { BufferedInput } from "./BufferedInput";
import { Label } from "@/components/ui/label";
import { PhoneWithDialCodeInput } from "@/components/shared/PhoneWithDialCodeInput";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const GROUP_SURFACE =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50 shadow-sm";

const FIELD_LABEL = "text-[12px] font-semibold text-foreground/80";

const INPUT_CLASS =
  "h-10 rounded-[10px] border-border/50 bg-white text-[13px] font-medium text-foreground dark:bg-card dark:border-white/20 dark:hover:border-white/40 dark:focus-visible:ring-white";

interface BookingContactFormProps {
  email: string;
  phone: string;
  onEmailChange: (email: string) => void;
  onPhoneChange: (phone: string) => void;
  disabled?: boolean;
  description?: string;
  showErrors?: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingContactForm({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  disabled = false,
  description,
  showErrors = false,
}: BookingContactFormProps) {
  const { t } = useTranslation();
  const contactDescription =
    description ??
    t(
      "We'll use these details to confirm your booking and send your e-ticket.",
    );

  const isEmailInvalid = showErrors && (!email?.trim() || !EMAIL_PATTERN.test(email.trim()));
  const digits = phone ? phone.replace(/\D/g, "") : "";
  const isPhoneInvalid = showErrors && (!phone?.trim() || digits.length < 7);

  return (
    <div className={cn(GROUP_SURFACE, "space-y-3 p-3 md:p-4")}>
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-redmix/5 dark:bg-foreground text-redmix">
          <Mail className="h-[16px] w-[16px]" />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-foreground/80">
            {t("Booking")}
          </p>
          <h3 className="text-[17px] font-semibold tracking-tight text-foreground">
            {t("Contact Information")}
          </h3>
          <p className="mt-0.5 text-[12px] font-medium leading-snug text-foreground/85">
            {contactDescription}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>
            {t("Email")} <span className="text-redmix">*</span>
          </Label>
          <BufferedInput
            type="email"
            placeholder={t("you@example.com")}
            value={email}
            disabled={disabled}
            onChange={onEmailChange}
            className={cn(
              INPUT_CLASS,
              isEmailInvalid && "border-red-500 focus-visible:ring-red-500/30 dark:border-red-500 focus-within:ring-red-500/30 focus-within:border-red-500 focus:border-red-500"
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>
            {t("Phone Number")} <span className="text-redmix">*</span>
          </Label>
          <PhoneWithDialCodeInput
            value={phone}
            disabled={disabled}
            onChange={onPhoneChange}
            className="h-10 rounded-[10px] text-[13px] font-medium dark:border-white/20 dark:focus-within:ring-white dark:hover:border-white/40"
            hasError={isPhoneInvalid}
          />
        </div>
      </div>
    </div>
  );
}
