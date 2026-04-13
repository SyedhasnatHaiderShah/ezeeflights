'use client';

import { useMemo } from 'react';

type SeatStatus = 'available' | 'occupied' | 'blocked' | 'reserved';
type SeatPosition = 'window' | 'middle' | 'aisle';

interface Seat {
  col: string;
  class: string;
  position: SeatPosition;
  status: SeatStatus;
  price: number;
}

interface SeatRow {
  row: number;
  seats: Seat[];
}

export function SeatMap({ seatMapData, selectedSeat, onSelect, passengerIndex = 0 }: {
  seatMapData: SeatRow[];
  selectedSeat?: string;
  passengerIndex?: number;
  onSelect: (seatCode: string, price: number) => void;
}) {
  const legend = useMemo(() => [
    { label: 'Window', icon: '🪟' },
    { label: 'Aisle', icon: '🚶' },
    { label: 'Middle', icon: '⬛' },
  ], []);

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">Passenger {passengerIndex + 1}</div>
      <div className="grid gap-2">
        {seatMapData.map((row) => (
          <div key={row.row} className="flex items-center gap-2">
            <div className="w-8 text-sm text-slate-500">{row.row}</div>
            {row.seats.map((seat) => {
              const code = `${row.row}${seat.col}`;
              const isSelected = selectedSeat === code;
              const seatClass = seat.status === 'occupied'
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : seat.status === 'blocked'
                ? 'bg-[repeating-linear-gradient(45deg,#d1d5db,#d1d5db_4px,#9ca3af_4px,#9ca3af_8px)] text-white cursor-not-allowed'
                : isSelected
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-300 hover:border-emerald-500';

              return (
                <button
                  key={code}
                  type="button"
                  title={`${code} • ${seat.position} • $${seat.price}`}
                  disabled={seat.status === 'occupied' || seat.status === 'blocked'}
                  onClick={() => onSelect(code, seat.price)}
                  className={`h-9 w-9 rounded text-xs font-semibold ${seatClass}`}
                >
                  {seat.col}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        {legend.map((l) => (
          <span key={l.label}>{l.icon} {l.label}</span>
        ))}
      </div>
    </div>
  );
}
