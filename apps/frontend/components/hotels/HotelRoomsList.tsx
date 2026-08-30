import { Users, Bed, ShieldCheck, Coffee } from "lucide-react";
import { HotelBookNowButton } from "./HotelBookNowButton";
import { cn } from "@/lib/utils";

interface HotelRoomsListProps {
  hotel: any;
  checkInDate: string | null;
  checkOutDate: string | null;
  nights: number;
}

export function HotelRoomsList({
  hotel,
  checkInDate,
  checkOutDate,
  nights,
}: HotelRoomsListProps) {
  if (!hotel.rooms || hotel.rooms.length === 0) return null;

  return (
    <section id="rooms" className="space-y-3">
      <div className="grid gap-8">
        {hotel.rooms.map((room: any) => (
          <div
            key={room.id}
            className="group bg-white dark:bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="flex flex-col xl:flex-row">
              {/* Image */}
              {/* Image */}
              <div className="relative w-full xl:w-72 h-48 xl:h-auto shrink-0 overflow-hidden border-b xl:border-b-0 xl:border-r border-border bg-slate-100 dark:bg-muted/40 flex items-center justify-center">
                {room.images?.[0]?.url && !room.images[0].url.includes("placeholder") && !room.images[0].url.includes("images.unsplash.com") ? (
                  <img
                    src={room.images[0].url}
                    alt={room.roomType || room.name}
                    className="w-full h-48 xl:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-slate-200/80 dark:bg-muted flex items-center justify-center text-slate-400 dark:text-muted-foreground text-base shadow-inner">
                      🛏️
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-muted-foreground leading-tight">
                      No images found
                    </p>
                  </div>
                )}
                {room.isAvailableForUpgrade && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-redmix to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm tracking-wider">
                    Priority Upgrade
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold leading-tight text-foreground">
                      {room.roomType || room.name || "Standard Room"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold tracking-widest text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-foreground/80">
                        <Users className="w-3.5 h-3.5" /> {room.capacity ? `${room.capacity} Guests` : "2 Adults"}
                      </span>
                      <span className="flex items-center gap-1.5 text-foreground/80">
                        <Bed className="w-3.5 h-3.5" /> {room.bedInfo || "1 King/Queen Bed"}
                      </span>
                      {room.availableRooms && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                          ⚡ {room.availableRooms} rooms available
                        </span>
                      )}
                    </div>
                  </div>

                  {room.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {room.description}
                    </p>
                  )}

                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {room.amenities.map((a: string) => (
                        <span
                          key={a}
                          className="inline-flex items-center rounded-md bg-slate-50 dark:bg-muted/30 px-2 py-0.5 text-xs font-bold text-slate-500 border border-slate-100"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <p
                      className={cn(
                        "text-xs font-bold flex items-center gap-1.5",
                        room.freeCancellation
                          ? "text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20"
                          : "text-slate-600 bg-slate-200/50 px-2.5 py-1 rounded-md border border-slate-300/30",
                      )}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />{" "}
                      {room.freeCancellation
                        ? "Free Cancellation"
                        : "Non-refundable"}
                      {room.cancelDeadline ? ` (before ${room.cancelDeadline.slice(0, 10)})` : ""}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-md border",
                        (room.mealPolicy && room.mealPolicy !== "Room Only") || room.breakfastIncluded
                          ? "text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-300"
                          : "text-slate-600 bg-slate-200/50 border-slate-300/30 dark:text-slate-400",
                      )}
                    >
                      <Coffee className="w-3.5 h-3.5" />{" "}
                      {room.mealPolicy || (room.breakfastIncluded ? "Breakfast Included" : "Room Only")}
                    </p>
                    {room.paymentPolicy && (
                      <p className="text-xs font-bold flex items-center gap-1.5 text-purple-700 bg-purple-500/10 border border-purple-500/20 dark:text-purple-300 px-2.5 py-1 rounded-md">
                        💳 {room.paymentPolicy}
                      </p>
                    )}
                  </div>
                </div>

                {checkInDate && checkOutDate && (
                  <div className="pt-2">
                    <HotelBookNowButton
                      hotelId={hotel.id}
                      roomId={room.id}
                      roomType={room.name}
                      pricePerNight={room.pricePerNight}
                      checkIn={checkInDate}
                      checkOut={checkOutDate}
                      label="Select Room"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
