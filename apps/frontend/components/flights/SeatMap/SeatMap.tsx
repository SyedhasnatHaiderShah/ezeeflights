'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Armchair, Info } from 'lucide-react';

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
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
        {/* Airplane Nose Mockup */}
        <div className="mb-8 h-12 w-32 rounded-t-full border-t-2 border-x-2 border-white/20 bg-gradient-to-b from-white/10 to-transparent" />
        
        <div className="relative rounded-[3rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-inner">
          <div className="grid gap-4">
            {seatMapData.map((row) => (
              <div key={row.row} className="flex items-center gap-4">
                <div className="w-6 text-[10px] font-bold text-white/30 uppercase tracking-tighter">{row.row}</div>
                
                <div className="flex items-center gap-2">
                  {row.seats.map((seat, sIdx) => {
                    const code = `${row.row}${seat.col}`;
                    const isSelected = selectedSeat === code;
                    const isOccupied = seat.status === 'occupied' || seat.status === 'blocked';
                    
                    // Add aisle spacing
                    const isAisleRight = sIdx === Math.floor(row.seats.length / 2) - 1;

                    return (
                      <div key={code} className="flex items-center">
                        <button
                          type="button"
                          disabled={isOccupied}
                          onClick={() => onSelect(code, seat.price)}
                          className={cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300",
                            isSelected 
                              ? "bg-brand-red border-brand-red text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-110 z-10" 
                              : isOccupied
                                ? "bg-white/5 border-white/5 text-white/10 cursor-not-allowed"
                                : "bg-white/10 border-white/10 text-white/60 hover:bg-white/20 hover:border-white/30 hover:scale-105"
                          )}
                        >
                          <span className="text-[10px] font-bold">{seat.col}</span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white shadow-sm border border-brand-red" />
                          )}
                        </button>
                        {isAisleRight && <div className="mx-4 w-6 border-x border-white/5 h-10 flex items-center justify-center text-[8px] text-white/10 uppercase vertical-text">Aisle</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 rounded-2xl bg-white/5 p-4 border border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="h-4 w-4 rounded bg-white/10 border border-white/10" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="h-4 w-4 rounded bg-brand-red border border-brand-red shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="h-4 w-4 rounded bg-white/5 border border-white/5" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-yellow/80">
          <Info className="h-3.5 w-3.5" />
          <span>Window & Aisle seats may have extra charges</span>
        </div>
      </div>
    </div>
  );
}
