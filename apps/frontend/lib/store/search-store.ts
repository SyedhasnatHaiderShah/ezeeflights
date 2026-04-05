import { create } from 'zustand';

interface SearchState {
  origin: string;
  destination: string;
  date: string;
  setField: (key: 'origin' | 'destination' | 'date', value: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  origin: 'DXB',
  destination: 'LHR',
  date: new Date().toISOString().slice(0, 10),
  setField: (key, value) => set((state) => ({ ...state, [key]: value })),
}));
