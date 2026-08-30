'use client';

export function HotelOptionsGrid({ options, onSelect }: { options: any[]; onSelect: (option: any) => void }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Hotel options</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((hotel) => (
          <button key={hotel.id} type="button" onClick={() => onSelect(hotel)} className="rounded border p-3 text-left hover:bg-slate-50">
            <p className="font-medium">{hotel.hotelName}</p>
            <p className="text-sm text-slate-500">Rating: {hotel.rating}</p>
            <p className="text-sm">
              {hotel.currency} {Number(hotel.pricePerNight).toFixed(2)} / night
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
