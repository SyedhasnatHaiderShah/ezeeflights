import { HotelDetailsContainer } from '@/components/containers/hotel-details-container';
import { internalV1Url } from '@/lib/bff/config';

export default async function HotelDetailsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { checkInDate?: string; checkOutDate?: string };
}) {
  const [hotelRes, roomsRes] = await Promise.all([
    fetch(internalV1Url(`hotels/${params.id}`), { cache: 'no-store' }),
    fetch(
      internalV1Url(
        `hotels/${params.id}/rooms?checkInDate=${searchParams.checkInDate ?? ''}&checkOutDate=${searchParams.checkOutDate ?? ''}`,
      ),
      { cache: 'no-store' },
    ),
  ]);

  const hotel = await hotelRes.json();
  const rooms = await roomsRes.json();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{hotel.name}</h1>
      <p>
        {hotel.address}, {hotel.city}, {hotel.country}
      </p>
      <p>{hotel.description}</p>
      <HotelDetailsContainer hotelId={params.id} rooms={rooms} />
    </section>
  );
}
