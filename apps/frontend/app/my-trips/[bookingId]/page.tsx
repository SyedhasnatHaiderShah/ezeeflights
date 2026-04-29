import Link from "next/link";
import { getTripById } from "@/lib/api/trips";
import { DocumentDownloadButton } from "@/components/trips/DocumentDownloadButton";
import { TripShareActions } from "@/components/trips/TripShareActions";
import { TripTimeline } from "@/components/trips/TripTimeline";
import { CancellationModal } from "@/components/trips/CancellationModal";
import { TravelDocumentsPanel } from "@/components/travel-documents/TravelDocumentsPanel";
import {
  Plane,
  Users,
  FileText,
  HelpCircle,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

import { redirect } from "next/navigation";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  let trip;
  try {
    trip = await getTripById(bookingId);
  } catch (error) {
    console.error("Failed to fetch trip:", error);
    redirect("/");
  }

  if (!trip) redirect("/");

  const shareText = encodeURIComponent(
    `Booking ${trip.confirmationCode}\n${trip.title}\nStatus: ${trip.status}\nTotal: ${trip.currency} ${trip.total.toFixed(2)}`,
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-7xl px-4 mx-auto space-y-8">
          {/* Navigation */}
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-redmix transition-all"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>

          {/* Main Ticket Header */}
          <header className="relative overflow-hidden rounded-[2.5rem] bg-brand-dark-blue p-8 md:p-12 text-white shadow-2xl">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg",
                      trip.status === "confirmed"
                        ? "bg-emerald-500 text-white"
                        : "bg-brand-yellow text-brand-dark-blue",
                    )}
                  >
                    {trip.status}
                  </span>
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Ref: {trip.confirmationCode}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                  {trip.title}
                </h1>
                <div className="flex flex-wrap gap-6 text-sm font-medium text-white/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-yellow" />
                    {new Date(trip.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-brand-yellow" />
                    {trip.currency} {trip.total.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <TripShareActions
                  confirmationCode={trip.confirmationCode}
                  shareText={shareText}
                />
              </div>
            </div>

            {/* Abstract Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 h-64 w-64 rounded-full bg-redmix/20 blur-[80px]" />
          </header>

          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            {/* Left Column: Details */}
            <div className="space-y-8">
              {/* Section Tabs (Visual Only) */}
              <div className="flex gap-4 border-b border-border/40 pb-4 overflow-x-auto no-scrollbar">
                {[
                  { id: "details", label: "Trip Details", icon: Plane },
                  { id: "passengers", label: "Passengers", icon: Users },
                  { id: "documents", label: "Documents", icon: FileText },
                ].map((tab, i) => (
                  <button
                    key={tab.id}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                      i === 0
                        ? "bg-redmix text-white shadow-lg shadow-redmix/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Flight specific details */}
              {trip.flight && (
                <section className="rounded-[2rem] border bg-card p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-2xl bg-redmix/10 flex items-center justify-center text-redmix">
                      <Plane className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">
                        Flight Information
                      </h2>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        PNR: {trip.flight.pnr}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-8">
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/30">
                      <div className="text-center">
                        <p className="text-3xl font-black">
                          {trip.flight.origin}
                        </p>
                        <p className="text-xs text-muted-foreground font-bold">
                          DEPARTURE
                        </p>
                      </div>
                      <div className="flex-1 flex flex-col items-center px-8">
                        <div className="w-full h-[2px] bg-dashed-border relative flex items-center justify-center">
                          <Plane className="h-5 w-5 text-redmix absolute bg-white p-0.5 rounded-full rotate-90" />
                        </div>
                        <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Non-stop
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-black">
                          {trip.flight.destination}
                        </p>
                        <p className="text-xs text-muted-foreground font-bold">
                          ARRIVAL
                        </p>
                      </div>
                    </div>

                    <TripTimeline items={trip.flight.timeline} />
                  </div>
                </section>
              )}

              {/* Passengers Section */}
              <section className="rounded-[2rem] border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight">
                    Passenger List
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {trip.passengers.map((passenger, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-2xl border bg-muted/20"
                    >
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-blue-600">
                        {passenger.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black">
                          {passenger.fullName}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {passenger.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Documents Section */}
              <section className="rounded-[2rem] border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight">
                    Travel Documents
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="group relative rounded-2xl border bg-white p-4 transition-all hover:border-redmix">
                    <DocumentDownloadButton
                      bookingId={trip.id}
                      docType="ticket"
                      label="E-Ticket"
                    />
                    <div className="mt-2 text-[10px] font-bold text-muted-foreground uppercase text-center">
                      PDF Download
                    </div>
                  </div>
                  <div className="group relative rounded-2xl border bg-white p-4 transition-all hover:border-redmix">
                    <DocumentDownloadButton
                      bookingId={trip.id}
                      docType="voucher"
                      label="Invoice"
                    />
                    <div className="mt-2 text-[10px] font-bold text-muted-foreground uppercase text-center">
                      Receipt
                    </div>
                  </div>
                  <div className="group relative rounded-2xl border bg-white p-4 transition-all hover:border-redmix">
                    <DocumentDownloadButton
                      bookingId={trip.id}
                      docType="insurance"
                      label="Voucher"
                    />
                    <div className="mt-2 text-[10px] font-bold text-muted-foreground uppercase text-center">
                      Trip Voucher
                    </div>
                  </div>
                </div>
              </section>

              <TravelDocumentsPanel
                title="Premium Document Wallet"
                bookingId={trip.id}
              />
            </div>

            {/* Right Column: Assistance & Actions */}
            <aside className="space-y-6">
              {/* Help Card */}
              <section className="rounded-[2.5rem] border bg-card p-8 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-redmix/10 flex items-center justify-center text-redmix mb-6">
                  <HelpCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2">
                  Need assistance?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Our 24/7 travel concierge is ready to help with any
                  modifications or questions about your trip.
                </p>
                <Link
                  href="/support/tickets/new"
                  className="flex items-center justify-center w-full bg-brand-dark-blue text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-dark-blue/20 hover:scale-[1.02] transition-transform"
                >
                  Open Support Ticket
                </Link>
              </section>

              {/* Policy Card */}
              <section className="rounded-[2.5rem] border bg-card p-8 shadow-sm border-t-4 border-t-redmix">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert className="h-6 w-6 text-redmix" />
                  <h2 className="text-lg font-black tracking-tight">
                    Policies
                  </h2>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Cancellation Window
                    </p>
                    <div className="flex items-start gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 mt-0.5 text-redmix" />
                      <p>{trip.policy.cancellationWindow}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/40">
                    <CancellationModal
                      bookingId={trip.id}
                      canCancel={trip.policy.canCancel}
                      refundEstimate={trip.policy.refundEstimate}
                    />
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
