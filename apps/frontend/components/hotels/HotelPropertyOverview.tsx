import { Check } from "lucide-react";

export function HotelPropertyOverview({ hotel }: { hotel: any }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">Property Overview</h2>
      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {hotel.amenities.map((amenity: string) => (
            <div
              key={amenity}
              className="flex items-center gap-3 p-4 bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-brand-red/20 transition-colors"
            >
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold">{amenity}</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed font-medium pt-2 max-w-3xl">
        {hotel.description ||
          `${hotel.name} offers a refined experience in ${hotel.city}. This ${
            hotel.starRating || hotel.rating
          }-star ${(hotel.type || "property").toLowerCase()} combines modern elegance with exceptional service.`}
      </p>
    </section>
  );
}
