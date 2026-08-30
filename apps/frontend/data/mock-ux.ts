export interface FareTier {
  name: string;
  priceDiff: number;
  benefits: { label: string; included: boolean }[];
}

export const mockFareTiers: FareTier[] = [
  {
    name: "Light",
    priceDiff: 0,
    benefits: [
      { label: "1x Personal Item", included: true },
      { label: "Checked Baggage", included: false },
      { label: "Seat Selection", included: false },
      { label: "Refundable", included: false },
    ]
  },
  {
    name: "Standard",
    priceDiff: 150,
    benefits: [
      { label: "1x Personal Item", included: true },
      { label: "Checked Baggage (23kg)", included: true },
      { label: "Standard Seat Selection", included: true },
      { label: "Refundable", included: false },
    ]
  },
  {
    name: "Flex",
    priceDiff: 350,
    benefits: [
      { label: "1x Personal Item", included: true },
      { label: "Checked Baggage (2x 23kg)", included: true },
      { label: "Extra Legroom Seat", included: true },
      { label: "Full Refund / Free Change", included: true },
    ]
  }
];

export const generateFlexibleDates = (baseDate: string, basePrice: number) => {
  const dates = [];
  const start = new Date(baseDate);
  
  for (let i = -3; i <= 3; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    
    // Pseudo-random price variation for heat-map
    const variance = (Math.sin(d.getDate()) * 200) + (i * 50);
    const price = Math.round(basePrice + variance);
    
    dates.push({
      date: d.toISOString().split('T')[0],
      price,
      status: price < basePrice - 100 ? 'cheap' : price > basePrice + 100 ? 'expensive' : 'neutral'
    });
  }
  return dates;
};

export const currencyExchange = {
  "USD": 1,
  "AED": 3.67,
  "EUR": 0.92,
  "PKR": 278,
};
export const mockBudgetCombos = [
  {
    id: "combo-1",
    title: "Bali Tropical Escape",
    destination: "Bali, Indonesia",
    duration: 5,
    passengers: 2,
    totalPrice: 1800,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    flight: "Qatar Airways (Round-trip)",
    hotel: "Ayana Resort & Spa (4 Nights)",
  },
  {
    id: "combo-2",
    title: "Dubai Skyline Adventure",
    destination: "Dubai, UAE",
    duration: 3,
    passengers: 1,
    totalPrice: 950,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    flight: "Emirates (Direct)",
    hotel: "Address Downtown (2 Nights)",
  },
  {
    id: "combo-3",
    title: "Paris Romance",
    destination: "Paris, France",
    duration: 7,
    passengers: 2,
    totalPrice: 2400,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    flight: "Air France (Premium)",
    hotel: "Hôtel Ritz (6 Nights)",
  },
  {
    id: "combo-4",
    title: "Istanbul Heritage",
    destination: "Istanbul, Turkey",
    duration: 4,
    passengers: 3,
    totalPrice: 1500,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
    flight: "Turkish Airlines",
    hotel: "Four Seasons Sultanahmet (3 Nights)",
  },
];
