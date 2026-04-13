import { create } from 'zustand';

export interface FlightFilters {
  stops: {
    nonstop: boolean;
    oneStop: boolean;
    twoStops: boolean;
  };
  airlines: string[];
  priceRange: [number, number];
  durationRange: [number, number];
  layoverRange: [number, number];
  takeoffRange: [number, number];
  landingRange: [number, number];
  hideBasicTickets: boolean;
  bookOnKayak: boolean;
  smartQuery: string;
  cabinClass: string[];
  layoverAirports: string[];
  amenities: string[];
}

interface FlightFilterState {
  filters: FlightFilters;
  setFilter: <K extends keyof FlightFilters>(key: K, value: FlightFilters[K]) => void;
  resetFilters: () => void;
}

const initialFilters: FlightFilters = {
  stops: {
    nonstop: true,
    oneStop: true,
    twoStops: true,
  },
  airlines: [],
  priceRange: [0, 10000], // Will be updated by data
  durationRange: [0, 100], // 0-100 scale for slider
  layoverRange: [0, 100],
  takeoffRange: [0, 100],
  landingRange: [0, 100],
  hideBasicTickets: false,
  bookOnKayak: false,
  smartQuery: '',
  cabinClass: [],
  layoverAirports: [],
  amenities: [],
};

export const useFlightFilterStore = create<FlightFilterState>((set) => ({
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}));
