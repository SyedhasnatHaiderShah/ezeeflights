'use client';

import { create } from 'zustand';

type Passenger = {
  fullName: string;
  passportNumber: string;
  seatNumber: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
};

interface BookingFlowState {
  selectedFlightIds: string[];
  passengers: Passenger[];
  setFlights: (ids: string[]) => void;
  setPassengers: (passengers: Passenger[]) => void;
}

export const useBookingFlowStore = create<BookingFlowState>((set) => ({
  selectedFlightIds: [],
  passengers: [],
  setFlights: (ids) => set({ selectedFlightIds: ids }),
  setPassengers: (passengers) => set({ passengers }),
}));
