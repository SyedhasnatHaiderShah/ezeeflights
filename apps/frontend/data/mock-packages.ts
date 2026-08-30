import { PackageDetails } from "@/lib/api/packages-api";

export type MockPackage = PackageDetails & {
  themes: string[];
  agencyTag?: string;
  isLimitedTimeDeal?: boolean;
  dealEndsAt?: string; // ISO string
  itemizedPrice: number;
  savingsPercentage: number;
  isB2B?: boolean;
  alternativeHotels: Array<{ id: string; name: string; priceDiff: number; rating?: number; image?: string }>;
  alternativeFlights: Array<{ id: string; name: string; time: string; priceDiff: number; airline?: string }>;
  itemisedPricing: {
    flights: number;
    hotel: number;
    transfers: number;
    activities: number;
  };
};

export const mockPackages: MockPackage[] = [
  {
    id: "pkg-1",
    title: "Ultra Luxury Dubai Escape",
    slug: "ultra-luxury-dubai-escape",
    destination: "Dubai",
    country: "UAE",
    durationDays: 5,
    basePrice: 2450,
    currency: "USD",
    thumbnailUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    status: "published",
    description: "Experience the pinnacle of luxury with a stay at the world-renowned Burj Al Arab and a private desert safari. This curated bundle offers unparalleled access to Dubai's most exclusive experiences.",
    pricing: { adultPrice: 2450, childPrice: 1850, infantPrice: 450 },
    themes: ["Luxury", "Honeymoon", "Adventure"],
    agencyTag: "EzeeExclusive",
    isLimitedTimeDeal: true,
    dealEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), 
    itemizedPrice: 3800,
    savingsPercentage: 35,
    isB2B: false,
    itemisedPricing: {
      flights: 1200,
      hotel: 1800,
      transfers: 300,
      activities: 500
    },
    itinerary: [
      { id: "it-1", dayNumber: 1, title: "Arrival & Private Transfer", description: "VIP pickup and check-in at Burj Al Arab." },
      { id: "it-2", dayNumber: 2, title: "Private Yacht Cruise", description: "4-hour private yacht experience around Palm Jumeirah." },
      { id: "it-3", dayNumber: 3, title: "Desert Safari", description: "Premium desert dunes dinner with private guide." },
      { id: "it-4", dayNumber: 4, title: "Leisure & Shopping", description: "Exclusive personal shopper service at Dubai Mall." },
      { id: "it-5", dayNumber: 5, title: "Departure", description: "Private helicopter transfer to DXB." },
    ],
    inclusions: [
      { id: "inc-1", type: "Stay", description: "5 Nights at Burj Al Arab" },
      { id: "inc-2", type: "Flight", description: "Business Class Return Flights" },
      { id: "inc-3", type: "Meal", description: "All Meals Included" },
      { id: "inc-4", type: "Activity", description: "Private Desert Safari" }
    ],
    exclusions: [
      { id: "exc-1", description: "Visa Fees" },
      { id: "exc-2", description: "Personal Expenses" },
    ],
    alternativeHotels: [
      { id: "alt-h1", name: "Atlantis The Royal", priceDiff: 450, rating: 5, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" },
      { id: "alt-h2", name: "Armani Hotel Dubai", priceDiff: 250, rating: 5, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945" },
    ],
    alternativeFlights: [
      { id: "alt-f1", name: "Emirates First Class", time: "09:30 AM", priceDiff: 800, airline: "Emirates" },
      { id: "alt-f2", name: "Qatar Airways QSuite", time: "11:00 AM", priceDiff: 600, airline: "Qatar Airways" },
    ],
  },
  {
    id: "pkg-2",
    title: "Swiss Alps Adventure",
    slug: "swiss-alps-adventure",
    destination: "Interlaken",
    country: "Switzerland",
    durationDays: 7,
    basePrice: 3200,
    currency: "USD",
    thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    status: "published",
    description: "A breathtaking journey through the heart of the Swiss Alps, featuring skiing, hiking, and chocolate tasting. Perfect for adventure seekers and nature lovers.",
    pricing: { adultPrice: 3200, childPrice: 2400, infantPrice: 800 },
    themes: ["Adventure", "Family", "Nature"],
    agencyTag: "GlobalTravels",
    isLimitedTimeDeal: false,
    itemizedPrice: 4500,
    savingsPercentage: 28,
    isB2B: true,
    itemisedPricing: {
      flights: 1500,
      hotel: 2000,
      transfers: 400,
      activities: 600
    },
    itinerary: [
      { id: "it-6", dayNumber: 1, title: "Zurich Arrival", description: "Train transfer to Interlaken." },
      { id: "it-7", dayNumber: 2, title: "Jungfraujoch Tour", description: "Journey to the Top of Europe." },
      { id: "it-8", dayNumber: 3, title: "Skiing in Grindelwald", description: "Full day ski pass and equipment." },
    ],
    inclusions: [
      { id: "inc-4", type: "Stay", description: "7 Nights Boutique Chalet" },
      { id: "inc-5", type: "Activities", description: "Swiss Travel Pass included" },
    ],
    exclusions: [],
    alternativeHotels: [],
    alternativeFlights: [],
  },
  {
    id: "pkg-3",
    title: "Bali Tropical Paradise",
    slug: "bali-tropical-paradise",
    destination: "Ubud",
    country: "Indonesia",
    durationDays: 10,
    basePrice: 1200,
    currency: "USD",
    thumbnailUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    status: "published",
    description: "Relax in the lush jungles of Ubud and the pristine beaches of Seminyak. This 10-day retreat is designed for ultimate rejuvenation.",
    pricing: { adultPrice: 1200, childPrice: 900, infantPrice: 300 },
    themes: ["Relaxation", "Culture", "Beach"],
    agencyTag: "ZenTrips",
    isLimitedTimeDeal: true,
    dealEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), 
    itemizedPrice: 1800,
    savingsPercentage: 33,
    isB2B: false,
    itemisedPricing: {
      flights: 800,
      hotel: 700,
      transfers: 150,
      activities: 150
    },
    itinerary: [],
    inclusions: [],
    exclusions: [],
    alternativeHotels: [],
    alternativeFlights: [],
  }
];
