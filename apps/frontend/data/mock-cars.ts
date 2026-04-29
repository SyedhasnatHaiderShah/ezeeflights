import { Car } from "@/lib/api/cars";

export type CarCategory =
  | "Economy"
  | "Compact"
  | "SUV"
  | "Luxury"
  | "Electric"
  | "Van";

export interface CarInsurance {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
}

export interface CarExtra {
  id: string;
  name: string;
  pricePerDay: number;
  icon: string;
}

export interface CarRental extends Car {
  name: string;
  type: string;
  bags: number;
  partnerNetwork: {
    name: string;
    logo: string;
    rating: number;
  };
  freeCancellation: boolean;
  pickupType: "Terminal" | "Shuttle" | "Meet & Greet";
  location: string;
  insuranceOptions: CarInsurance[];
  extras: CarExtra[];
}

export const MOCK_CARS: CarRental[] = [
  {
    id: "car-1",
    name: "Tesla Model 3",
    make: "Tesla",
    model: "Model 3",
    type: "Electric Sedan",
    category: "Electric",
    transmission: "Automatic",
    seats: 5,
    doors: 4,
    bags: 2,
    fuelType: "Electric",
    airConditioning: true,
    pricePerDay: 85,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop",
    ],
    partnerNetwork: {
      name: "Hertz",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Hertz_logo.svg/2560px-Hertz_logo.svg.png",
      rating: 4.8,
    },
    features: ["Autopilot", "Long Range", "Glass Roof", "Premium Audio"],
    unlimitedMileage: true,
    freeCancellation: true,
    pickupType: "Terminal",
    location: "London Heathrow Terminal 5",
    insuranceOptions: [
      {
        id: "ins-1",
        name: "Basic",
        description: "Third party liability only",
        pricePerDay: 0,
      },
      {
        id: "ins-2",
        name: "Standard",
        description: "Collision Damage Waiver with $1000 excess",
        pricePerDay: 15,
      },
      {
        id: "ins-3",
        name: "Premium",
        description: "Zero excess, theft protection, and glass/tire cover",
        pricePerDay: 25,
      },
    ],
    extras: [
      {
        id: "ext-1",
        name: "Additional Driver",
        pricePerDay: 10,
        icon: "UserPlus",
      },
      { id: "ext-2", name: "Child Seat", pricePerDay: 8, icon: "Baby" },
      { id: "ext-3", name: "GPS Navigation", pricePerDay: 5, icon: "Map" },
    ],
  },
  {
    id: "car-2",
    name: "Range Rover Sport",
    make: "Land Rover",
    model: "Range Rover Sport",
    type: "Luxury SUV",
    category: "SUV",
    transmission: "Automatic",
    seats: 5,
    doors: 5,
    bags: 4,
    fuelType: "Diesel",
    airConditioning: true,
    pricePerDay: 145,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?q=80&w=800&auto=format&fit=crop",
    ],
    partnerNetwork: {
      name: "Sixt",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sixt_logo.svg/1200px-Sixt_logo.svg.png",
      rating: 4.6,
    },
    features: [
      "All-Wheel Drive",
      "Leather Interior",
      "Heated Seats",
      "Surround Sound",
    ],
    unlimitedMileage: false,
    freeCancellation: true,
    pickupType: "Meet & Greet",
    location: "London Gatwick North Terminal",
    insuranceOptions: [
      {
        id: "ins-1",
        name: "Basic",
        description: "Third party liability",
        pricePerDay: 0,
      },
      {
        id: "ins-2",
        name: "Full Coverage",
        description: "No excess on any damage",
        pricePerDay: 35,
      },
    ],
    extras: [
      {
        id: "ext-1",
        name: "Additional Driver",
        pricePerDay: 15,
        icon: "UserPlus",
      },
      { id: "ext-2", name: "GPS", pricePerDay: 10, icon: "Map" },
    ],
  },
  {
    id: "car-3",
    name: "Volkswagen Polo",
    make: "Volkswagen",
    model: "Polo",
    type: "Hatchback",
    category: "Economy",
    transmission: "Manual",
    seats: 5,
    doors: 5,
    bags: 1,
    fuelType: "Petrol",
    airConditioning: true,
    pricePerDay: 32,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop",
    ],
    partnerNetwork: {
      name: "Europcar",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Europcar_logo.svg/2560px-Europcar_logo.svg.png",
      rating: 4.2,
    },
    features: ["Bluetooth", "Air Conditioning", "Fuel Efficient"],
    unlimitedMileage: true,
    freeCancellation: false,
    pickupType: "Shuttle",
    location: "London Luton Airport",
    insuranceOptions: [
      {
        id: "ins-1",
        name: "Basic",
        description: "Third party liability",
        pricePerDay: 0,
      },
      {
        id: "ins-2",
        name: "Standard",
        description: "Reduced excess",
        pricePerDay: 12,
      },
    ],
    extras: [{ id: "ext-2", name: "Child Seat", pricePerDay: 5, icon: "Baby" }],
  },
  {
    id: "car-4",
    name: "Mercedes-Benz E-Class",
    make: "Mercedes-Benz",
    model: "E-Class",
    type: "Executive Sedan",
    category: "Luxury",
    transmission: "Automatic",
    seats: 5,
    doors: 4,
    bags: 3,
    fuelType: "Hybrid",
    airConditioning: true,
    pricePerDay: 110,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop",
    ],
    partnerNetwork: {
      name: "Avis",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Avis_logo.svg/2560px-Avis_logo.svg.png",
      rating: 4.5,
    },
    features: ["Smart Drive", "Ambient Lighting", "Premium Seats"],
    unlimitedMileage: true,
    freeCancellation: true,
    pickupType: "Terminal",
    location: "London Heathrow Terminal 2",
    insuranceOptions: [
      {
        id: "ins-1",
        name: "Basic",
        description: "Standard protection",
        pricePerDay: 0,
      },
      {
        id: "ins-2",
        name: "Complete",
        description: "Total peace of mind cover",
        pricePerDay: 30,
      },
    ],
    extras: [
      {
        id: "ext-1",
        name: "Additional Driver",
        pricePerDay: 12,
        icon: "UserPlus",
      },
      { id: "ext-3", name: "WiFi Hotspot", pricePerDay: 8, icon: "Wifi" },
    ],
  },
];
