import Link from 'next/link';

interface Props {
  hotel: {
    id: string;
    name: string;
    city: string;
    country: string;
    rating: number;
    minPricePerNight: number;
    currency: string;
  };
  checkInDate: string;
  checkOutDate: string;
}

export function HotelCard({ hotel, checkInDate, checkOutDate }: Props) {
  return (
    <article className="rounded border bg-white p-4">
      <h3 className="font-semibold">{hotel.name}</h3>
      <p>
        {hotel.city}, {hotel.country}
      </p>
      <p>{hotel.rating}★</p>
      <p>
        From {hotel.currency} {hotel.minPricePerNight}/night
      </p>
      <Link
        href={`/hotels/${hotel.id}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`}
        className="mt-3 inline-block rounded bg-blue-600 px-3 py-2 text-sm text-white"
      >
        View details
      </Link>
    </article>
  );
}
