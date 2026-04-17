interface InlineFlightCardProps {
  id: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureAt: string;
  baseFare: number;
  currency: string;
}

export function InlineFlightCard(props: InlineFlightCardProps) {
  return (
    <article className="mt-2 rounded-xl border bg-slate-50 p-3 text-sm">
      <p className="font-semibold">{props.airlineCode} {props.flightNumber}</p>
      <p>{props.departureAirport} → {props.arrivalAirport}</p>
      <p>{new Date(props.departureAt).toLocaleString()}</p>
      <p className="font-bold">{props.currency} {props.baseFare}</p>
      <a className="mt-2 inline-block rounded bg-emerald-600 px-3 py-1 text-white" href={`/flights/${props.id}`}>
        Book now
      </a>
    </article>
  );
}
