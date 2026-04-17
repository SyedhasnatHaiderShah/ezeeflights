interface InlineHotelCardProps {
  id: string;
  name: string;
  city: string;
  starRating: number;
  nightlyRate: number;
  currency: string;
}

export function InlineHotelCard(props: InlineHotelCardProps) {
  return (
    <article className="mt-2 rounded-xl border bg-slate-50 p-3 text-sm">
      <p className="font-semibold">{props.name}</p>
      <p>{props.city} · {'★'.repeat(props.starRating)}</p>
      <p className="font-bold">{props.currency} {props.nightlyRate} / night</p>
      <a className="mt-2 inline-block rounded bg-emerald-600 px-3 py-1 text-white" href={`/hotels?hotel=${props.id}`}>
        Book now
      </a>
    </article>
  );
}
