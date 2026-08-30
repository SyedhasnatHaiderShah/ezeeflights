'use client';

export function FlightOptionsList({ options, onSelect }: { options: any[]; onSelect: (option: any) => void }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Flight options</h3>
      {options.map((flight) => (
        <button
          key={flight.id}
          className="flex w-full items-center justify-between rounded border p-3 text-left hover:bg-slate-50"
          onClick={() => onSelect(flight)}
          type="button"
        >
          <span>{flight.airline}</span>
          <span>
            {flight.currency} {Number(flight.price).toFixed(2)}
          </span>
        </button>
      ))}
    </section>
  );
}
