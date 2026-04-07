'use client';

import { create } from 'zustand';

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
  setTrip: (hotelId: string, checkInDate: string, checkOutDate: string) => void;
  setRooms: (rooms: SelectedRoom[]) => void;
  setGuests: (guests: Guest[]) => void;
  reset: () => void;
}

export const useHotelBookingFlowStore = create<HotelBookingFlowState>((set) => ({
  hotelId: null,
  checkInDate: '',
  checkOutDate: '',
  selectedRooms: [],
  guests: [],
  setTrip: (hotelId, checkInDate, checkOutDate) => set({ hotelId, checkInDate, checkOutDate }),
  setRooms: (rooms) => set({ selectedRooms: rooms }),
  setGuests: (guests) => set({ guests }),
  reset: () =>
    set({
      hotelId: null,
      checkInDate: '',
      checkOutDate: '',
      selectedRooms: [],
      guests: [],
    }),
}));
