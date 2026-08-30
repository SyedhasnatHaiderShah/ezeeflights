"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider text-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function ContactForm({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [attemptedSubmit, setAttemptedSubmit] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!name.trim() || !email.trim() || !isEmailValid || !message.trim()) {
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className={cn(
          "rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center",
          className,
        )}
      >
        <p className="text-sm font-semibold text-foreground">
          {t("Thank you! We will get back to you as soon as possible.")}
        </p>
      </div>
    );
  }

  const isNameInvalid = attemptedSubmit && !name.trim();
  const isEmailInvalid = attemptedSubmit && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
  const isMessageInvalid = attemptedSubmit && !message.trim();

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "space-y-4 rounded-xl border border-border/60 bg-muted/20 p-5 md:p-6",
        className,
      )}
    >
      <h3 className="text-base font-bold text-foreground">
        {t("Connect With Us")}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("Name")} id="contact-name">
          <Input
            id="contact-name"
            name="name"
            placeholder={t("Enter Your Name")}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              "h-10 text-xs font-semibold rounded-lg transition-all",
              isNameInvalid && "border-red-500 focus-visible:ring-red-500/30"
            )}
          />
        </Field>
        <Field label={t("Email")} id="contact-email">
          <Input
            id="contact-email"
            name="email"
            type="email"
            placeholder={t("Enter Your Email")}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "h-10 text-xs font-semibold rounded-lg transition-all",
              isEmailInvalid && "border-red-500 focus-visible:ring-red-500/30"
            )}
          />
        </Field>
      </div>

      <Field label={t("Phone No.")} id="contact-phone">
        <Input
          id="contact-phone"
          name="phone"
          placeholder={t("Enter Your Phone")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-10 text-xs font-semibold rounded-lg"
        />
      </Field>

      <Field label={t("Message")} id="contact-message">
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder={t("Enter Your Message")}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(
            "flex w-full rounded-lg border border-input bg-background px-4 py-3 text-xs font-semibold ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all",
            isMessageInvalid && "border-red-500 focus-visible:ring-red-500/30"
          )}
        />
      </Field>

      <Button
        type="submit"
        className="h-10 rounded-lg bg-redmix px-6 font-bold text-xs text-white shadow-lg shadow-redmix/20 hover:brightness-110"
      >
        {t("Submit")}
      </Button>
    </form>
  );
}
