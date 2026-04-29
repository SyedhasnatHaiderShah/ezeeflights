"use client";

import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  Share2, 
  Calendar, 
  MapPin, 
  CreditCard,
  ArrowRight,
  Sparkles,
  QrCode,
  Loader2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getHotelBookingById, HotelBooking } from "@/lib/api/hotels";

export default function HotelConfirmationPage({ 
  searchParams 
}: { 
  searchParams: { bookingId?: string } 
}) {
  const bookingId = searchParams.bookingId;
  const [booking, setBooking] = useState<HotelBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;

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
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-red" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Retrieving your booking confirmation...</p>
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          {/* Success Banner */}
          <div className="relative mb-12 text-center space-y-6 py-12 px-8 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[3rem] border border-emerald-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
            
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 animate-in zoom-in duration-700">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-xl animate-bounce">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
              <h1 className="text-3xl font-bold tracking-tight">Booking Confirmed!</h1>
              <p className="text-sm text-muted-foreground font-medium">
                Pack your bags! Your stay at <span className="text-foreground font-bold">{booking.hotelName}</span> has been successfully reserved.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-in fade-in duration-1000 delay-300">
              Reference: {booking.id}
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Left Column: Details */}
            <div className="md:col-span-3 space-y-8">
              <div className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-border/50 shadow-sm space-y-8">
                <h2 className="text-xl font-bold">Stay Details</h2>
                
                <div className="grid gap-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-muted/50 rounded-2xl shrink-0">
                      <Calendar className="w-5 h-5 text-brand-red" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Check-in / Out</p>
                      <p className="text-sm font-bold">
                        {new Date(booking.checkInDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} — 
                        {new Date(booking.checkOutDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} 
                        ({nights} Night{nights > 1 ? 's' : ''})
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-3 bg-muted/50 rounded-2xl shrink-0">
                      <MapPin className="w-5 h-5 text-brand-red" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Property Address</p>
                      <p className="text-sm font-bold">{booking.hotelAddress || 'Address available in your confirmation email'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-3 bg-muted/50 rounded-2xl shrink-0">
                      <CreditCard className="w-5 h-5 text-brand-red" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Payment Status</p>
                      <p className="text-sm font-bold flex items-center gap-2 capitalize">
                        {booking.paymentStatus === 'PAID' ? 'Authorized & Paid' : 'Pay at Property'} 
                        <span className={cn("w-2 h-2 rounded-full", booking.paymentStatus === 'PAID' ? "bg-emerald-500" : "bg-amber-500")} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="flex items-center justify-between p-5 bg-brand-red/[0.03] rounded-[1.5rem] border border-brand-red/10">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-brand-red">Need to make changes?</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Manage your booking in your dashboard</p>
                  </div>
                  <Link href="/dashboard" className="p-3 bg-background rounded-xl hover:shadow-lg transition-all border border-border/50">
                    <ArrowRight className="w-4 h-4 text-brand-red" />
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Download, label: "E-Voucher" },
                  { icon: Printer, label: "Invoice" },
                  { icon: Share2, label: "Share Details" },
                ].map((action) => (
                  <button key={action.label} className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-card/40 backdrop-blur-md rounded-2xl border border-border/50 hover:bg-muted/30 transition-all text-xs font-bold shadow-sm">
                    <action.icon className="w-4 h-4 text-muted-foreground" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: QR & Next Steps */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-slate-950 dark:bg-slate-900 p-8 rounded-[2.5rem] text-center space-y-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/20 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-brand-red/30 transition-colors duration-1000" />
                
                <div className="relative z-10 space-y-6">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Mobile Check-in</p>
                  <div className="w-40 h-40 bg-white p-4 rounded-3xl mx-auto shadow-2xl transform transition-transform group-hover:scale-105 duration-500">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                  <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                    Scan this code at the property kiosk for <br />
                    <span className="text-brand-red font-bold">Express Check-in</span>
                  </p>
                </div>
              </div>

              <div className="bg-card/40 backdrop-blur-md p-6 rounded-[2rem] border border-border/50 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recommended for you</h3>
                <Link href="/dashboard" className="flex items-center justify-between p-4 bg-background rounded-2xl hover:border-brand-red transition-all border border-border/50">
                  <div className="space-y-1">
                    <p className="text-xs font-bold">Airport Transfer</p>
                    <p className="text-[10px] text-muted-foreground">Book a ride to your hotel</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link href="/flights" className="flex items-center justify-between p-4 bg-background rounded-2xl hover:border-brand-red transition-all border border-border/50">
                  <div className="space-y-1">
                    <p className="text-xs font-bold">Next Trip</p>
                    <p className="text-[10px] text-muted-foreground">Explore more destinations</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
