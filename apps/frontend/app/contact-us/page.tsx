"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import SectionLayout, {
  CompanyHeading,
  CompanyProse,
  CompanySection,
} from "@/components/sections/SectionLayout";
import { ContactForm } from "@/components/sections/ContactForm";
import { useTranslation } from "react-i18next";
import {
  getContactLocations,
  getDomainConfig,
  formatDomainText,
  type ContactLocation,
} from "@/lib/utils/domain";

const DEFAULT_LOCATIONS: ContactLocation[] = [
  {
    country: "United States",
    city: "San Francisco Office",
    address:
      "945 Taraval Street, San Francisco, CA 94116, United States of America",
    phone: "+1-888-604-0198",
    flagType: "image",
    flagSrc: "/usa.png",
  },
];

export default function ContactUsPage() {
  const { t } = useTranslation();
  const [locations, setLocations] =
    React.useState<ContactLocation[]>(DEFAULT_LOCATIONS);
  const [hostname, setHostname] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
      setLocations(getContactLocations(window.location.hostname));
    }
  }, []);

  const fd = (text: string) => formatDomainText(text, hostname, t);
  const supportEmail = hostname
    ? getDomainConfig(hostname).supportEmail
    : "sales@ezeeflights.com";

  return (
    <SectionLayout
      title={t("Contact Us")}
      subtitle={fd(t("Contact Us - Flights Booking UAE"))}
    >
      <div className="h-full">
        <CompanySection className="space-y-6">
          <div className="space-y-4">
            <CompanyProse>
              {fd(
                t(
                  "At Ezeeflights, we're always here to help! Whether you have questions about booking, need assistance with your flight, or want to give feedback, our friendly support team is ready to assist you. Reach out to us via email, phone, or the contact form below, and we'll get back to you as soon as possible. Your travel experience is our priority, and we're happy to ensure it goes smoothly.",
                ),
              )}
            </CompanyProse>
            <CompanyProse>
              {fd(
                t(
                  "We're here to help you 24/7 with your travel needs, bookings, and support.",
                ),
              )}
            </CompanyProse>
          </div>

          <hr className="border-border/50" />

          <div className="space-y-6">
            {locations.map((loc, idx) => (
              <div
                key={`${loc.address}-${idx}`}
                className="space-y-6 border-b border-border/20 pb-6 last:border-none last:pb-0"
              >
                {(locations.length > 1 || loc.flagType) && (
                  <div className="flex items-center gap-2 mb-3">
                    {loc.flagType === "image" && loc.flagSrc ? (
                      <div className="h-5 w-7 shrink-0 overflow-hidden rounded border border-border/50 shadow-sm flex items-center justify-center bg-muted">
                        <img
                          src={loc.flagSrc}
                          alt={t(loc.country || "Flag")}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : loc.flagType === "svg" && loc.flagSvg ? (
                      <div className="h-5 w-7 shrink-0 overflow-hidden rounded border border-border/50 shadow-sm flex items-center justify-center bg-muted">
                        {loc.flagSvg}
                      </div>
                    ) : null}
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {t(loc.city)} ({t(loc.country)})
                    </h3>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-redmix/10 text-redmix">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <CompanyHeading className="border-none pb-0 text-sm">
                      {t("Address")}
                    </CompanyHeading>
                    <p className="text-sm font-semibold text-foreground">
                      {t(loc.address)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-redmix/10 text-redmix">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <CompanyHeading className="border-none pb-0 text-sm">
                      {t("Phone")}
                    </CompanyHeading>
                    <a
                      href={`tel:${loc.phone.replace(/[^\d+]/g, "")}`}
                      className="text-sm font-bold text-foreground hover:text-redmix transition-all"
                    >
                      {loc.phone}
                    </a>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-redmix/10 px-2 py-0.5 text-[10px] font-bold text-redmix">
                        {t("24×7 Available")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-3 pt-4 border-t border-border/50">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-redmix/10 text-redmix">
                <Mail className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <CompanyHeading className="border-none pb-0 text-sm">
                  {t("Email")}
                </CompanyHeading>
                <Link
                  href={`mailto:${supportEmail}`}
                  className="text-sm font-bold text-redmix hover:underline"
                >
                  {supportEmail}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {fd(
                    t(
                      "Feel free to get in touch with us anytime for assistance or inquiries related to your international flight bookings.",
                    ),
                  )}
                </p>
              </div>
            </div>
          </div>
        </CompanySection>
      </div>

      <div className="h-full">
        <ContactForm className="sticky top-24" />
      </div>
    </SectionLayout>
  );
}
