'use client';

import { create } from 'zustand';
import { Hotel } from '../types/hotels';

type SelectedRoom = {
  roomId: string;
  roomType: string;
  quantity: number;
  pricePerNight: number;
};

type Guest = {
  fullName: string;
  age: number;
  type: 'ADULT' | 'CHILD';
  roomId: string;
};

interface HotelBookingFlowState {
  hotelId: string | null;
  checkInDate: string;
  checkOutDate: string;
  selectedRooms: SelectedRoom[];
  guests: Guest[];
  /** Full hotel object cached from search results — avoids re-fetching from backend */
  selectedHotel: Hotel | null;
  isSelecting: boolean;
  setTrip: (hotelId: string, checkInDate: string, checkOutDate: string) => void;
  setRooms: (rooms: SelectedRoom[]) => void;
  setGuests: (guests: Guest[]) => void;
  setSelectedHotel: (hotel: Hotel) => void;
  setIsSelecting: (isSelecting: boolean) => void;
  reset: () => void;
}

export const useHotelBookingFlowStore = create<HotelBookingFlowState>((set) => ({
  hotelId: null,
  checkInDate: '',
  checkOutDate: '',
  selectedRooms: [],
  guests: [],
  selectedHotel: typeof window !== 'undefined' && window.sessionStorage.getItem('ezee_selected_hotel')
    ? (() => {
        try {
          return JSON.parse(window.sessionStorage.getItem('ezee_selected_hotel') || 'null');
        } catch {
          return null;
        }
      })()
    : null,
  isSelecting: false,
  setTrip: (hotelId, checkInDate, checkOutDate) => set({ hotelId, checkInDate, checkOutDate }),
  setRooms: (rooms) => set({ selectedRooms: rooms }),
  setGuests: (guests) => set({ guests }),
  setSelectedHotel: (hotel) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('ezee_selected_hotel', JSON.stringify(hotel));
    }
    set({ selectedHotel: hotel });
  },
  setIsSelecting: (isSelecting) => set({ isSelecting }),
  reset: () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('ezee_selected_hotel');
    }
    set({
      hotelId: null,
      checkInDate: '',
      checkOutDate: '',
      selectedRooms: [],
      guests: [],
      selectedHotel: null,
      isSelecting: false,
    });
  },
}));
