"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FlightListItem } from "@/lib/types/flight-api";

type Passenger = {
  fullName: string;
  passportNumber: string;
  phoneNumber?: string;
  seatNumber?: string;
  type: "ADULT" | "CHILD" | "INFANT";
};

type SelectedAncillary = {
  ancillaryId: string;
  passengerIndex: number;
  quantity: number;
  unitPrice: number;
};

export type AddonType = "HOTEL" | "CAR" | "INSURANCE" | "ATTRACTION";

export interface SelectedAddon {
  id: string;
  type: AddonType;
  name: string;
  price: number;
}


interface BookingFlowState {
  selectedFlightIds: string[];
  /** Full card data from results — used on booking page for Trip Summary. */
  selectedFlight: FlightListItem | null;
  bookingId?: string;
  passengers: Passenger[];
  selectedSeats: Record<number, { seatCode: string; price: number }>;
  ancillaries: SelectedAncillary[];
  selectedAddons: SelectedAddon[];
  isSelectingCar: boolean;
  selectingFlightId: string | null;
  setFlights: (ids: string[]) => void;
  setSelectedFlight: (flight: FlightListItem | null) => void;
  setPassengers: (passengers: Passenger[]) => void;
  setBookingId: (bookingId: string) => void;
  setSeat: (passengerIndex: number, seatCode: string, price: number) => void;
  setAncillaries: (items: SelectedAncillary[]) => void;
  toggleAddon: (addon: SelectedAddon) => void;
  setIsSelectingCar: (val: boolean) => void;
  setSelectingFlightId: (id: string | null) => void;
  clearAddons: () => void;
}

export const useBookingFlowStore = create<BookingFlowState>()(
  persist(
    (set) => ({
      selectedFlightIds: [],
      selectedFlight: null,
      passengers: [],
      selectedSeats: {},
      ancillaries: [],
      selectedAddons: [],
      isSelectingCar: false,
      selectingFlightId: null,
      setFlights: (ids) => set({ selectedFlightIds: ids }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setPassengers: (passengers) => set({ passengers }),
      setBookingId: (bookingId) => set({ bookingId }),
      setSeat: (passengerIndex, seatCode, price) =>
        set((state) => ({
          selectedSeats: {
            ...state.selectedSeats,
            [passengerIndex]: { seatCode, price },
          },
        })),
      setAncillaries: (items) => set({ ancillaries: items }),
      toggleAddon: (addon) =>
        set((state) => {
          const exists = state.selectedAddons.some((a) => a.id === addon.id);
          if (exists) {
            return {
              selectedAddons: state.selectedAddons.filter((a) => a.id !== addon.id),
            };
          }
          // Mutually exclusive: only allow one HOTEL and one CAR addon at a time
          const filtered = (addon.type === "HOTEL" || addon.type === "CAR")
            ? state.selectedAddons.filter((a) => a.type !== addon.type)
            : state.selectedAddons;
          return { selectedAddons: [...filtered, addon] };
        }),
      setIsSelectingCar: (val) => set({ isSelectingCar: val }),
      setSelectingFlightId: (id) => set({ selectingFlightId: id }),
      clearAddons: () => set({ selectedAddons: [], isSelectingCar: false, selectingFlightId: null }),
    }),
    {
      name: "ezee-booking-flow",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
