"use client";

import * as React from "react";
import { Suspense } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import {
  Calendar,
  MapPin,
  CreditCard,
  Sparkles,
  Loader2,
  Copy,
  Download,
  CalendarPlus,
  Share2,
  Hotel as HotelIcon,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getHotelBookingById, HotelBooking } from "@/lib/api/hotels";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function HotelConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { t } = useTranslation();
  const { bookingId } = React.use(searchParams);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-brand-red" />
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
            {t("Loading your booking confirmation...")}
          </p>
        </div>
      }
    >
      <ConfirmationContent bookingId={bookingId} />
    </Suspense>
  );
}

function ConfirmationContent({ bookingId }: { bookingId?: string }) {
  const { t } = useTranslation();
  const [booking, setBooking] = useState<HotelBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const data = await getHotelBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        console.error("Failed to fetch booking details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-brand-red" />
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
          {t("Retrieving your booking confirmation...")}
        </p>
      </div>
    );
  }

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(booking.checkOutDate).getTime() -
        new Date(booking.checkInDate).getTime()) /
        (24 * 60 * 60 * 1000),
    ) || 1,
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-brand-red/10 selection:text-brand-red">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <section className="mx-auto max-w-4xl px-4 space-y-8">
          {/* Header Success Section */}
          <div className="text-center space-y-4">
            <motion.svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="mx-auto text-redmix"
            >
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
              />
              <motion.path
                d="M20 33l8 8 16-16"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              />
            </motion.svg>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {t("Booking Confirmed!")}
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
              {t("Your stay at")}{" "}
              <span className="text-foreground font-bold">
                {booking.hotelName}
              </span>{" "}
              {t("is reserved.")}
            </p>

            <div className="inline-flex items-center gap-2 rounded-2xl border bg-card/60 backdrop-blur-md px-4 py-2 shadow-sm transition-all hover:border-border">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                {t("Booking reference")}
              </span>
              <span className="font-mono text-sm font-semibold">
                {booking.id}
              </span>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(booking.id);
                  toast({
                    title: t("Copied!"),
                    description: t("Booking reference copied to clipboard."),
                  });
                }}
                className="rounded-lg p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stay Info Card */}
          <div className="rounded-3xl border bg-card/40 backdrop-blur-md p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-redmix/10 rounded-2xl flex items-center justify-center text-redmix shrink-0">
                  <HotelIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                    {t("Hotel details")}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {booking.hotelName}
                  </p>
                </div>
              </div>
              <div className="text-right sm:text-right">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  {t("Total price")}
                </p>
                <p className="text-2xl font-black text-redmix">
                  {booking.currency} {booking.totalPrice.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Grid options */}
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="flex gap-3">
                <Calendar className="w-5 h-5 text-redmix shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t("Check-in / Out")}
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {new Date(booking.checkInDate).toLocaleDateString(
                      undefined,
                      {
                        day: "numeric",
                        month: "short",
                      },
                    )}{" "}
                    —{" "}
                    {new Date(booking.checkOutDate).toLocaleDateString(
                      undefined,
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {nights} {nights > 1 ? t("Nights") : t("Night")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-redmix shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t("Address")}
                  </p>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">
                    {booking.hotelAddress ||
                      t("Address available in your confirmation email")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CreditCard className="w-5 h-5 text-redmix shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t("Payment & Status")}
                  </p>
                  <p className="text-xs font-semibold flex items-center gap-1.5 capitalize text-foreground">
                    {booking.paymentStatus === "PAID"
                      ? t("Authorized & Paid")
                      : t("Payment Pending")}
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        booking.paymentStatus === "PAID"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-snug">
                    {booking.paymentStatus !== "PAID" &&
                      t("Our support team will contact you shortly.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Room configurations */}
            {booking.rooms && booking.rooms.length > 0 && (
              <div className="border-t border-border/50 pt-5 space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("Stay Summary")}
                </p>
                <div className="grid gap-2">
                  {booking.rooms.map((r: any) => (
                    <div
                      key={r.id}
                      className="flex justify-between items-center rounded-xl bg-muted/30 border border-border/40 p-3 text-xs font-semibold"
                    >
                      <span className="text-foreground">
                        {booking.hotelName || t("Hotel")} × {r.quantity}
                      </span>
                      <span className="text-muted-foreground">
                        {booking.currency} {r.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guests persist */}
            {booking.guests && booking.guests.length > 0 && (
              <div className="border-t border-border/50 pt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t("Registered Guests")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {booking.guests.map((g: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground"
                    >
                      {g.fullName} ({t(g.type.toLowerCase())}, {t("age")} {g.age})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* What's Next Section */}
          {/* <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">What's Next</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "Download Voucher", icon: Download, desc: "Save your hotel booking confirmation details locally." },
                { title: "Add to Calendar", icon: CalendarPlus, desc: "Add check-in stay date markers directly to your calendar." },
                { title: "Share Stay Details", icon: Share2, desc: "Send companion reservation updates to other family members." },
              ].map(({ title, icon: Icon, desc }) => (
                <div key={title} className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 space-y-3 shadow-sm transition-all hover:border-border">
                  <Icon className="h-5 w-5 text-redmix" />
                  <p className="font-bold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  <button className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold transition-all hover:bg-muted active:scale-95 cursor-pointer">
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div> */}

          {/* CTAs */}
          <div className="flex flex-wrap ms-auto float-right gap-3 pt-2">
            <Link
              href="/my-trips"
              className="rounded-xl bg-redmix text-white px-5 py-3 text-sm font-semibold shadow-md shadow-brand-red/20 transition-all hover:bg-brand-red-light active:scale-95 cursor-pointer"
            >
              {t("View My Trips")}
            </Link>
            <Link
              href="/flights"
              className="rounded-xl border border-border bg-card/60 backdrop-blur-md px-5 py-3 text-sm font-semibold transition-all hover:bg-muted active:scale-95 cursor-pointer"
            >
              {t("Book a Flight")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
