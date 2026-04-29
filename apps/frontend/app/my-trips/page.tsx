"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getMyTrips, TripStatusFilter, TripSummary } from "@/lib/api/trips";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { TripCard } from "@/components/trips/TripCard";
import { TripTabs, TripTab } from "@/components/trips/TripTabs";
import { AppImage } from "@/components/ui/app-image";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PostTripReviewModal } from "@/components/reviews/PostTripReviewModal";
import {
  Gift,
  Star,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Plane,
} from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop";

export default function MyTripsPage() {
  const [tab, setTab] = useState<TripTab>("all");
  const [status, setStatus] = useState<TripStatusFilter>("upcoming");
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { data: session, isLoading: sessionLoading } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (session) {
      getMyTrips(tab === "all" ? undefined : tab, status)
        .then(setTrips)
        .catch(() => setTrips([]));
    }
  }, [tab, status, session]);

  const counts = useMemo(() => {
    const base: Record<TripTab, number> = {
      all: trips.length,
      flight: 0,
      hotel: 0,
      package: 0,
      car: 0,
      transfer: 0,
    };
    trips.forEach((trip) => {
      if (trip.type in base) base[trip.type as Exclude<TripTab, "all">] += 1;
    });
    return base;
  }, [trips]);

  const stats = useMemo(() => {
    const upcoming = trips.filter((t) => t.status === "upcoming").length;
    const completed = trips.filter((t) => t.status === "completed").length;
    const totalBookings = trips.length;
    return { upcoming, completed, totalBookings };
  }, [trips]);

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-[60vh] w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <AppImage
            src={HERO_IMAGE}
            alt="Travel adventures"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        <div className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-[1400px] flex-col items-center justify-center px-3 md:px-5 pb-10 text-white">
          <span className="mb-4 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">
            Your Travel Dashboard
          </span>
          <h1 className="text-hero text-center font-extrabold text-white">
            My{" "}
            <span className="bg-gradient-to-r from-redmix to-yellow bg-clip-text text-transparent">
              Trips
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-center text-lg text-white/80">
            Your unified bookings across flights, hotels, packages, cars, and
            transfers.
          </p>

          {/* Stats Grid */}
          <div className="mt-8 grid w-full max-w-2xl grid-cols-3 gap-3 rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md">
            <div className="text-center">
              <div className="text-xl font-extrabold">{stats.upcoming}</div>
              <p className="text-xs text-white/90">Upcoming</p>
            </div>
            <div className="text-center border-l border-white/30">
              <div className="text-xl font-extrabold">{stats.completed}</div>
              <p className="text-xs text-white/90">Completed</p>
            </div>
            <div className="text-center border-l border-white/30">
              <div className="text-xl font-extrabold">
                {stats.totalBookings}
              </div>
              <p className="text-xs text-white/90">Total Trips</p>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute bottom-4 text-white/80"
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="mx-auto w-full max-w-[1400px] px-3 md:px-5 py-8">
        <div className="space-y-6">
          <TripTabs active={tab} onChange={setTab} counts={counts} />

          {/* Pending Review Incentive Banner */}
          {status === "completed" && trips.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="overflow-hidden"
            >
              <div className="relative group bg-slate-950 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl border border-white/10 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/20 blur-[80px] -mr-20 -mt-20 opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[60px] -ml-20 -mb-20 opacity-30" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Star className="w-8 h-8 text-brand-red fill-brand-red" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-brand-red/20 text-brand-red text-[10px] font-black tracking-widest px-3 py-1 rounded-full border border-brand-red/20">
                          Loyalty Perk
                        </span>
                        <span className="text-white/40 text-[10px] font-bold tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3" /> Post-Trip Engagement
                        </span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">
                        Your London Trip is Pending Review
                      </h3>
                      <p className="text-sm text-white/60 font-medium max-w-md">
                        Share your experience and earn{" "}
                        <span className="text-white font-black underline decoration-brand-red underline-offset-4">
                          250 EzeePoints
                        </span>{" "}
                        instantly. Help the community and save on your next
                        trip!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="flex items-center gap-3 bg-brand-red text-white px-8 py-5 rounded-[1.5rem] font-black group/btn hover:shadow-2xl hover:shadow-brand-red/40 transition-all active:scale-95"
                  >
                    <Gift className="w-5 h-5 group-hover/btn:animate-bounce" />
                    Write a Review & Earn
                    <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-wrap gap-2">
            {(["upcoming", "completed", "cancelled"] as TripStatusFilter[]).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-sm capitalize transition-colors ${
                    status === item
                      ? "border-redmix bg-redmix/10 text-redmix"
                      : "border-slate-200 hover:border-redmix/50"
                  }`}
                  onClick={() => setStatus(item)}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          {trips.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Plane className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold">No trips found</p>
              <p className="mb-4 text-sm text-slate-600">
                Start planning your next journey.
              </p>
              <Link
                href="/flights"
                className="inline-block rounded-lg bg-redmix px-4 py-2 text-sm text-white transition hover:brightness-110"
              >
                Search flights
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
      <PostTripReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}
