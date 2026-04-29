import { getHotelDetails } from "@/lib/api/hotels";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PhotoGallery } from "@/components/hotels/PhotoGallery";
import { ReviewSection } from "@/components/hotels/ReviewSection";
import {
  MapPin,
  Wifi,
  Coffee,
  Wind,
  ShieldCheck,
  CreditCard,
  Clock,
  ChevronRight,
  Star,
  Sparkles,
  Calendar,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { RoomType } from "@/lib/types/hotels";
import { BookNowButton } from "@/components/hotels/BookNowButton";

export default async function HotelDetailsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { checkInDate?: string; checkOutDate?: string };
}) {
  const { checkInDate, checkOutDate } = searchParams;

  let hotel;
  try {
    hotel = await getHotelDetails(params.id);
  } catch (e) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Hotel not found</h1>
        <Link href="/hotels" className="text-brand-red mt-4">
          Back to search
        </Link>
      </div>
    );
  }

  const displayImages =
    hotel.images?.length > 0
      ? hotel.images
      : [
          {
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            caption: "Property Exterior",
          },
          {
            url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
            caption: "Deluxe Room",
          },
          {
            url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
            caption: "Hotel Lounge",
          },
          {
            url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            caption: "Swimming Pool",
          },
          {
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
            caption: "Breakfast Area",
          },
        ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-brand-red/10 selection:text-brand-red">
      <Header />

      <main className="flex-1 pt-20">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 md:px-6">
          {/* Breadcrumbs & Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Link
                  href="/hotels"
                  className="hover:text-brand-red transition-colors"
                >
                  Stays
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
                  <MapPin className="w-4 h-4 text-brand-red" />{" "}
                  {hotel.address || "Address available upon booking"},{" "}
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

            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  From
                </p>
                <p className="text-2xl font-bold text-brand-red leading-none">
                  {hotel.currency}{" "}
                  {hotel.minPricePerNight?.toLocaleString() || "0"}
                </p>
              </div>
              <button className="bg-brand-red text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-2xl hover:shadow-brand-red/30 transition-all active:scale-95">
                Check Availability
              </button>
            </div>
          </div>

          {/* Photo Gallery */}
          <PhotoGallery images={displayImages} className="mb-12 shadow-2xl" />

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column: Details & Rooms */}
            <div className="lg:col-span-2 space-y-16">
              {/* Overview */}
              <section className="space-y-6">
                <h2 className="text-xl font-bold">Property Overview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Free WiFi", icon: Wifi, color: "text-blue-500" },
                    {
                      label: "Breakfast",
                      icon: Coffee,
                      color: "text-amber-500",
                    },
                    { label: "Air Cond.", icon: Wind, color: "text-cyan-500" },
                    {
                      label: "Verified",
                      icon: ShieldCheck,
                      color: "text-emerald-500",
                    },
                  ].map((amenity) => (
                    <div
                      key={amenity.label}
                      className="flex items-center gap-3 p-4 bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-brand-red/20 transition-colors"
                    >
                      <amenity.icon className={cn("w-5 h-5", amenity.color)} />
                      <span className="text-xs font-bold">{amenity.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium pt-2 max-w-3xl">
                  {hotel.description ||
                    `${hotel.name} offers a refined experience in ${hotel.city}. This ${hotel.starRating || hotel.rating}-star ${(hotel.type || "property").toLowerCase()} combines modern elegance with exceptional service.`}
                </p>
              </section>

              {/* Rooms Section */}
              <section id="rooms" className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Available Room Types</h2>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" /> Best Price Guaranteed
                  </div>
                </div>

                <div className="grid gap-8">
                  {hotel.rooms?.map((room: RoomType) => (
                    <div
                      key={room.id}
                      className="bg-card/30 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-xl hover:border-brand-red/20 transition-all duration-300"
                    >
                      <div className="md:w-80 relative overflow-hidden shrink-0">
                        <img
                          src={
                            room.images[0]?.url ||
                            "https://images.unsplash.com/photo-1566073771259-6a8506099945"
                          }
                          alt={room.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        {room.isAvailableForUpgrade && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-redmix to-orange-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-xl uppercase tracking-wider">
                            Priority Upgrade
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-8 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="text-lg font-bold group-hover:text-brand-red transition-colors">
                              {room.name}
                            </h3>
                            <div className="text-right">
                              <p className="text-xl font-bold text-foreground">
                                {hotel.currency}{" "}
                                {room.pricePerNight.toLocaleString()}
                              </p>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase">
                                / night
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            {room.description}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {room.amenities.map((a) => (
                              <span
                                key={a}
                                className="text-[9px] font-bold text-muted-foreground border border-border/50 px-2.5 py-1 rounded-lg bg-muted/30"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border/30">
                          <div className="flex gap-6">
                            <div className="space-y-1">
                              <p
                                className={cn(
                                  "text-[10px] font-bold flex items-center gap-1.5",
                                  room.freeCancellation
                                    ? "text-emerald-500"
                                    : "text-muted/40",
                                )}
                              >
                                <ShieldCheck className="w-3 h-3" />{" "}
                                {room.freeCancellation
                                  ? "Free Cancellation"
                                  : "Non-refundable"}
                              </p>
                              <p
                                className={cn(
                                  "text-[10px] font-bold flex items-center gap-1.5",
                                  room.breakfastIncluded
                                    ? "text-amber-500"
                                    : "text-muted/40",
                                )}
                              >
                                <Coffee className="w-3 h-3" />{" "}
                                {room.breakfastIncluded
                                  ? "Breakfast Included"
                                  : "Room Only"}
                              </p>
                            </div>
                          </div>
                          <BookNowButton
                            hotelId={hotel.id}
                            roomId={room.id}
                            roomType={room.name}
                            pricePerNight={room.pricePerNight}
                            checkIn={checkInDate || ""}
                            checkOut={checkOutDate || ""}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Reviews Section */}
              <ReviewSection
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
            </div>

            {/* Right Column: Sticky Sidebar */}
            <div className="space-y-8">
              <div className="sticky top-28 space-y-8">
                {/* Stay Summary Card */}
                <div className="bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 shadow-xl p-8 space-y-8">
                  <h3 className="text-lg font-bold">Your Stay Details</h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted/50 rounded-2xl shrink-0">
                        <Calendar className="w-5 h-5 text-brand-red" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Check-in / Out
                        </p>
                        <p className="text-xs font-bold">
                          {checkInDate
                            ? new Date(checkInDate).toLocaleDateString()
                            : "Select Dates"}{" "}
                          —{" "}
                          {checkOutDate
                            ? new Date(checkOutDate).toLocaleDateString()
                            : "Select Dates"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted/50 rounded-2xl shrink-0">
                        <Users className="w-5 h-5 text-brand-red" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Guests
                        </p>
                        <p className="text-xs font-bold">2 Adults · 1 Room</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted/50 rounded-2xl shrink-0">
                        <Clock className="w-5 h-5 text-brand-red" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Times
                        </p>
                        <p className="text-xs font-bold">
                          In: 3:00 PM · Out: 12:00 PM
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                    <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> EzeeRewards Exclusive
                    </p>
                    <p className="text-[10px] text-amber-700/80 font-medium leading-relaxed">
                      Earn 1,240 points with this booking. Redeem for future
                      discounts or room upgrades.
                    </p>
                  </div>
                </div>

                {/* Map Preview */}
                <div className="bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden h-72 relative group cursor-pointer transition-all hover:border-brand-red/30">
                  <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/55.2708,25.2048,13,0/600x600?access_token=pk.placeholder')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="bg-background/90 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-xs transform group-hover:-translate-y-2 transition-transform">
                      <MapPin className="w-4 h-4 text-brand-red" />{" "}
                      <span>Explore Neighborhood</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
