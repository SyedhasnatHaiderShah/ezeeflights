"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Star,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { HotelPhotoGallery } from "@/components/hotels/HotelPhotoGallery";
import { HotelReviewSection } from "@/components/hotels/HotelReviewSection";
import { HotelStayDetailsCard } from "@/components/hotels/HotelStayDetailsCard";
import { HotelBookingSection } from "@/components/hotels/HotelBookingSection";
import { getHotelDetails } from "@/lib/api/hotels";
import { useHotelBookingFlowStore } from "@/lib/store/hotel-booking-flow-store";
import { getHotelStaySelection } from "@/lib/utils/hotel-stay";
import type { Hotel } from "@/lib/types/hotels";
import { useTranslation } from "react-i18next";

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 1;
  const diff =
    new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
}

export default function HotelDetailsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  const checkInDate = searchParams?.get("checkInDate") ?? "";
  const checkOutDate = searchParams?.get("checkOutDate") ?? "";

  const selectedHotel = useHotelBookingFlowStore((s) => s.selectedHotel);
  const setTrip = useHotelBookingFlowStore((s) => s.setTrip);
  const setRooms = useHotelBookingFlowStore((s) => s.setRooms);
  const setSelectedHotel = useHotelBookingFlowStore((s) => s.setSelectedHotel);

  const [hotel, setHotel] = useState<Hotel | null>(
    selectedHotel?.id === id ? selectedHotel : null,
  );
  const [loading, setLoading] = useState(!hotel);
  const [error, setError] = useState(false);

  const nights = useMemo(
    () => nightsBetween(checkInDate, checkOutDate),
    [checkInDate, checkOutDate],
  );

  // Keep booking store in sync with URL (survives refresh)
  useEffect(() => {
    if (!id || !checkInDate || !checkOutDate) return;
    setTrip(id, checkInDate, checkOutDate);
  }, [id, checkInDate, checkOutDate, setTrip]);

  // Load hotel details (with dates for pricing)
  useEffect(() => {
    if (!id) return;

    if (selectedHotel?.id === id) {
      setHotel(selectedHotel);
      setLoading(false);
    }

    setError(false);
    setLoading(true);
    getHotelDetails(id, checkInDate || undefined, checkOutDate || undefined)
      .then((data) => {
        setHotel(data);
        setSelectedHotel(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [id, checkInDate, checkOutDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hotel-level stay (no room picker) — sync store for booking API
  useEffect(() => {
    if (!hotel || !checkInDate || !checkOutDate) return;
    setRooms([getHotelStaySelection(hotel)]);
  }, [hotel, checkInDate, checkOutDate, setRooms]);

  if (!checkInDate || !checkOutDate) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20">
          <h1 className="text-xl font-bold">{t("Dates required")}</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
            {t("Please search for hotels with check-in and check-out dates, then select a property.")}
          </p>
          <Link
            href="/hotels"
            className="mt-6 text-brand-red font-semibold hover:underline"
          >
            {t("Back to hotel search")}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-red" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          {t("Loading hotel details...")}
        </p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">{t("Hotel not found")}</h1>
        <Link href="/hotels" className="text-brand-red mt-4">
          {t("Back to search")}
        </Link>
      </div>
    );
  }

  const displayImages = hotel.images || [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-brand-red/10 selection:text-brand-red">
      <Header />

      <main className="flex-1 pt-20">
        <div className="mx-auto w-full max-w-7xl px-3 py-5 md:px-5">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Link
                  href="/hotels"
                  className="hover:text-brand-red transition-colors"
                >
                  {t("Stays")}
                </Link>
                <ChevronRight className="w-3 h-3 opacity-50" />
                <Link
                  href={`/hotels/search?location=${hotel.city}`}
                  className="hover:text-brand-red transition-colors"
                >
                  {hotel.city}
                </Link>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {hotel.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <MapPin className="w-4 h-4 text-brand-red" />
                  {hotel.address || t("Address available upon booking")},{" "}
                  {hotel.city}, {hotel.country}
                </p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5",
                        i < (hotel.starRating || hotel.rating || 0)
                          ? "text-amber-500 fill-current"
                          : "text-muted/30",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {displayImages.length > 0 && (
            <HotelPhotoGallery images={displayImages} className="mb-12 shadow-2xl" />
          )}

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 mt-8">
            <div className="lg:col-span-2 space-y-10">
              <HotelBookingSection
                hotel={hotel}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                nights={nights}
              />

              {hotel.reviewCount > 0 &&
                hotel.reviews &&
                hotel.reviews.length > 0 && (
                  <HotelReviewSection
                    reviews={hotel.reviews}
                    sentiment={
                      hotel.aiSentimentSummary || {
                        pros: [],
                        cons: [],
                        overallSummary: "",
                      }
                    }
                    userRating={hotel.userRating}
                    totalReviews={hotel.reviewCount}
                  />
                )}
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-28">
                <HotelStayDetailsCard
                  hotel={hotel}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  nights={nights}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
