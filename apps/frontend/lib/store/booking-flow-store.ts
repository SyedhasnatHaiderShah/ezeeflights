'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Passenger = {
  fullName: string;
  passportNumber: string;
  seatNumber: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
};

type SelectedAncillary = { ancillaryId: string; passengerIndex: number; quantity: number; unitPrice: number };

interface BookingFlowState {
  selectedFlightIds: string[];
  bookingId?: string;
  passengers: Passenger[];
  selectedSeats: Record<number, { seatCode: string; price: number }>;
  ancillaries: SelectedAncillary[];
  setFlights: (ids: string[]) => void;
  setPassengers: (passengers: Passenger[]) => void;
  setBookingId: (bookingId: string) => void;
  setSeat: (passengerIndex: number, seatCode: string, price: number) => void;
  setAncillaries: (items: SelectedAncillary[]) => void;
}

export const useBookingFlowStore = create<BookingFlowState>()(
  persist(
    (set) => ({
      selectedFlightIds: [],
      passengers: [],
      selectedSeats: {},
      ancillaries: [],
      setFlights: (ids) => set({ selectedFlightIds: ids }),
      setPassengers: (passengers) => set({ passengers }),
      setBookingId: (bookingId) => set({ bookingId }),
      setSeat: (passengerIndex, seatCode, price) => set((state) => ({ selectedSeats: { ...state.selectedSeats, [passengerIndex]: { seatCode, price } } })),
      setAncillaries: (items) => set({ ancillaries: items }),
    }),
    {
      name: 'ezee-booking-flow',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
