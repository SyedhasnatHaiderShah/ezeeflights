interface FlightCardProps {
  id: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureAt: string;
  arrivalAt: string;
  baseFare: number;
  currency: string;
}

export function FlightCard(props: FlightCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">
        {props.airlineCode} {props.flightNumber}
      </h3>
      <p className="text-sm text-slate-600">
        {props.departureAirport} → {props.arrivalAirport}
      </p>
      <p className="text-sm">Depart: {new Date(props.departureAt).toLocaleString()}</p>
      <p className="text-sm">Arrive: {new Date(props.arrivalAt).toLocaleString()}</p>
      <p className="mt-2 text-xl font-bold">
        {props.currency} {props.baseFare.toFixed(2)}
      </p>
    </article>
  );
}
