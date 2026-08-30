export type DestinationCategory =
  | 'Museums'
  | 'Beaches'
  | 'Hiking'
  | 'Nightlife'
  | 'Shopping'
  | 'Food Tours';

export type DestinationRegion = 'AFRICA' | 'AMERICAS' | 'ASIA' | 'EUROPE' | 'MIDDLE EAST' | 'OCEANIA';

export interface DestinationCountry {
  id: string;
  name: string;
  code: string;
  region: DestinationRegion;
  heroImage: string;
  description: string;
  capital: string;
  currency: string;
  bestTime: string;
  visaNote: string;
  overview: string;
  featuredCities: string[];
  seasonalEvents: DestinationEvent[];
  aiTopFive: AiRecommendation[];
  budgetGuide: {
    low: string;
    mid: string;
    premium: string;
  };
}

export interface DestinationCity {
  id: string;
  slug: string;
  name: string;
  countryId: string;
  countryCode: string;
  countryName: string;
  region: DestinationRegion;
  heroImage: string;
  description: string;
  bestTime: string;
  travelStyle: string[];
  highlights: string[];
  mapCenter: { lat: number; lng: number };
  budgetGuide: string;
  nearbyNote: string;
}

export interface DestinationAttraction {
  id: string;
  slug: string;
  name: string;
  citySlug: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  category: DestinationCategory;
  rating: number;
  reviewCount: number;
  entryFee: number;
  currency: string;
  openingHours: string;
  tips: string[];
  description: string;
  image: string;
  bestFor: string;
  duration: string;
  bookingSource: 'GetYourGuide' | 'Viator' | 'Local';
  bookingLink: string;
  latitude: number;
  longitude: number;
  nearbyAttractions: string[];
  photos: string[];
  featured?: boolean;
}

export interface AttractionReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
  photos?: string[];
  title?: string;
}

export interface DestinationTour {
  id: string;
  provider: 'GetYourGuide' | 'Viator' | 'Local';
  title: string;
  duration: string;
  price: number;
  currency: string;
  bookingLink: string;
  highlights: string[];
}

export interface DestinationEvent {
  id: string;
  title: string;
  date: string;
  season: string;
  location: string;
  description: string;
}

export interface WishlistEntry {
  id: string;
  attractionId: string;
  name: string;
  city: string;
  country: string;
  category: DestinationCategory;
  image: string;
  savedAt: string;
}

export interface AiRecommendation {
  name: string;
  category: DestinationCategory | string;
  score: number;
  reason: string;
  bestTime: string;
}

export interface MapCluster {
  latBucket: number;
  lngBucket: number;
  count: number;
}

const COUNTRIES: DestinationCountry[] = [
  {
    id: 'uae',
    name: 'United Arab Emirates',
    code: 'UAE',
    region: 'MIDDLE EAST',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
    description: 'A modern desert gateway with luxury shopping, futuristic skylines, and unforgettable desert experiences.',
    capital: 'Abu Dhabi',
    currency: 'AED',
    bestTime: 'November to March',
    visaNote: 'Visa requirements depend on passport nationality; many travelers can obtain visa on arrival.',
    overview: 'Ideal for city breaks, luxury stays, desert adventures, and family-friendly attractions.',
    featuredCities: ['dubai', 'abu-dhabi'],
    seasonalEvents: [
      {
        id: 'uae-event-1',
        title: 'Dubai Shopping Festival',
        date: 'January',
        season: 'Winter',
        location: 'Dubai',
        description: 'Huge discounts, live entertainment, fireworks, and citywide activations.',
      },
      {
        id: 'uae-event-2',
        title: 'Abu Dhabi Grand Prix Week',
        date: 'December',
        season: 'Winter',
        location: 'Abu Dhabi',
        description: 'Motorsport events, concerts, and premium hospitality across the city.',
      },
    ],
    aiTopFive: [
      { name: 'Museum of the Future', category: 'Museums', score: 98, reason: 'Best for futuristic design and interactive exhibits.', bestTime: 'Morning' },
      { name: 'Dubai Creek Food Walk', category: 'Food Tours', score: 95, reason: 'Great for travelers who love local flavors and heritage markets.', bestTime: 'Late afternoon' },
      { name: 'Jumeirah Beach', category: 'Beaches', score: 92, reason: 'A relaxed beach stop with skyline views and sunset vibes.', bestTime: 'Sunset' },
      { name: 'Al Fahidi Historical District', category: 'Museums', score: 89, reason: 'Perfect for culture-first travelers.', bestTime: 'Early morning' },
      { name: 'Dubai Marina Night Cruise', category: 'Nightlife', score: 87, reason: 'Best for travelers seeking skyline views and dining.', bestTime: 'Evening' },
    ],
    budgetGuide: { low: '$120/day', mid: '$280/day', premium: '$650/day' },
  },
  {
    id: 'france',
    name: 'France',
    code: 'FRA',
    region: 'EUROPE',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80',
    description: 'Classic European experiences, world-famous cuisine, art museums, and scenic city escapes.',
    capital: 'Paris',
    currency: 'EUR',
    bestTime: 'April to June, September to October',
    visaNote: 'Schengen rules apply for many travelers.',
    overview: 'Perfect for romance, museums, food tours, wine trips, and heritage sightseeing.',
    featuredCities: ['paris', 'lyon'],
    seasonalEvents: [
      {
        id: 'fr-event-1',
        title: 'Bastille Day Celebrations',
        date: '14 July',
        season: 'Summer',
        location: 'Paris',
        description: 'Parades, fireworks, and festive city events across France.',
      },
      {
        id: 'fr-event-2',
        title: 'Nice Carnival',
        date: 'February',
        season: 'Winter',
        location: 'Nice',
        description: 'One of Europe’s most colorful seasonal festivals.',
      },
    ],
    aiTopFive: [
      { name: 'Louvre Museum', category: 'Museums', score: 99, reason: 'Iconic for first-time visitors and art lovers.', bestTime: 'Opening hour' },
      { name: 'Seine River Cruise', category: 'Nightlife', score: 93, reason: 'A scenic route for couples and families.', bestTime: 'Sunset' },
      { name: 'Montmartre Food Tour', category: 'Food Tours', score: 91, reason: 'Great for travelers who enjoy local cafés and pastry stops.', bestTime: 'Lunch' },
      { name: 'French Riviera Beaches', category: 'Beaches', score: 89, reason: 'Best for relaxed coastal stays.', bestTime: 'Afternoon' },
      { name: 'Versailles Gardens Walk', category: 'Hiking', score: 86, reason: 'Excellent for slow travel and scenic walks.', bestTime: 'Morning' },
    ],
    budgetGuide: { low: '€130/day', mid: '€260/day', premium: '€700/day' },
  },
  {
    id: 'thailand',
    name: 'Thailand',
    code: 'THA',
    region: 'ASIA',
    heroImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80',
    description: 'A vibrant mix of tropical islands, food adventures, temples, and buzzing nightlife.',
    capital: 'Bangkok',
    currency: 'THB',
    bestTime: 'November to February',
    visaNote: 'Check visa rules for your nationality; many travelers qualify for visa-free entry or visa on arrival.',
    overview: 'Best for beach holidays, nightlife, street food, wellness, and island hopping.',
    featuredCities: ['bangkok', 'phuket'],
    seasonalEvents: [
      {
        id: 'th-event-1',
        title: 'Songkran Water Festival',
        date: '13–15 April',
        season: 'Summer',
        location: 'Nationwide',
        description: 'The Thai New Year festival with citywide water celebrations.',
      },
      {
        id: 'th-event-2',
        title: 'Loi Krathong',
        date: 'November',
        season: 'Autumn',
        location: 'Chiang Mai / Bangkok',
        description: 'Lanterns, river rituals, and beautiful nighttime visuals.',
      },
    ],
    aiTopFive: [
      { name: 'Grand Palace', category: 'Museums', score: 96, reason: 'A must for first-time cultural visitors.', bestTime: 'Early morning' },
      { name: 'Bangkok Street Food Crawl', category: 'Food Tours', score: 95, reason: 'Ideal for adventurous food lovers.', bestTime: 'Evening' },
      { name: 'Phi Phi Island Day Trip', category: 'Beaches', score: 94, reason: 'Perfect for island-focused travelers.', bestTime: 'Midday' },
      { name: 'Bangkok Night Markets', category: 'Shopping', score: 90, reason: 'Great for souvenirs and local snacks.', bestTime: 'After 6 pm' },
      { name: 'Doi Inthanon Trek', category: 'Hiking', score: 88, reason: 'Best for travelers who want nature and cooler air.', bestTime: 'Morning' },
    ],
    budgetGuide: { low: '$45/day', mid: '$95/day', premium: '$220/day' },
  },
];

const CITIES: DestinationCity[] = [
  {
    id: 'dubai',
    slug: 'dubai',
    name: 'Dubai',
    countryId: 'uae',
    countryCode: 'UAE',
    countryName: 'United Arab Emirates',
    region: 'MIDDLE EAST',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
    description: 'Luxury skyline, desert safaris, beach clubs, and a huge mix of family-friendly experiences.',
    bestTime: 'November to March',
    travelStyle: ['Family friendly', 'Luxury', 'City break'],
    highlights: ['Skyscraper views', 'Desert adventures', 'Shopping malls', 'Beach walks'],
    mapCenter: { lat: 25.2048, lng: 55.2708 },
    budgetGuide: '$120 to $650/day depending on style',
    nearbyNote: 'Use the map to cluster attractions around Downtown, Marina, and Old Dubai.',
  },
  {
    id: 'abu-dhabi',
    slug: 'abu-dhabi',
    name: 'Abu Dhabi',
    countryId: 'uae',
    countryCode: 'UAE',
    countryName: 'United Arab Emirates',
    region: 'MIDDLE EAST',
    heroImage: 'https://images.unsplash.com/photo-1539650116574-75c0c6d1bdb7?auto=format&fit=crop&w=1400&q=80',
    description: 'A calmer capital with grand mosques, museums, and seaside relaxation.',
    bestTime: 'November to March',
    travelStyle: ['Culture', 'Relaxed', 'Family friendly'],
    highlights: ['Heritage sites', 'Waterfront dining', 'Museums', 'Theme parks'],
    mapCenter: { lat: 24.4539, lng: 54.3773 },
    budgetGuide: '$110 to $500/day depending on activities',
    nearbyNote: 'Attractions are clustered around Saadiyat Island, Yas Island, and the Corniche.',
  },
  {
    id: 'paris',
    slug: 'paris',
    name: 'Paris',
    countryId: 'france',
    countryCode: 'FRA',
    countryName: 'France',
    region: 'EUROPE',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80',
    description: 'Museums, river walks, cafes, and iconic landmarks for culture-first travelers.',
    bestTime: 'April to June, September to October',
    travelStyle: ['Romantic', 'Museum lover', 'Foodie'],
    highlights: ['Art museums', 'Historic neighborhoods', 'Dining', 'River cruises'],
    mapCenter: { lat: 48.8566, lng: 2.3522 },
    budgetGuide: '€130 to €700/day depending on style',
    nearbyNote: 'Attractions cluster around the Seine, the Left Bank, and central arrondissement districts.',
  },
  {
    id: 'lyon',
    slug: 'lyon',
    name: 'Lyon',
    countryId: 'france',
    countryCode: 'FRA',
    countryName: 'France',
    region: 'EUROPE',
    heroImage: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1400&q=80',
    description: 'A food capital with old town charm, riverside views, and excellent local experiences.',
    bestTime: 'May to October',
    travelStyle: ['Foodie', 'Historic', 'Walking tours'],
    highlights: ['Bouchon dining', 'Old town', 'Riverside strolls', 'Markets'],
    mapCenter: { lat: 45.764, lng: 4.8357 },
    budgetGuide: '€90 to €320/day depending on dining and stays',
    nearbyNote: 'Look for clusters around Vieux Lyon and Presqu’île.',
  },
  {
    id: 'bangkok',
    slug: 'bangkok',
    name: 'Bangkok',
    countryId: 'thailand',
    countryCode: 'THA',
    countryName: 'Thailand',
    region: 'ASIA',
    heroImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80',
    description: 'Street food, temples, rooftop bars, and dynamic markets in a nonstop city break.',
    bestTime: 'November to February',
    travelStyle: ['Foodie', 'Nightlife', 'Budget traveler'],
    highlights: ['Street markets', 'Temples', 'Rooftop views', 'Boat rides'],
    mapCenter: { lat: 13.7563, lng: 100.5018 },
    budgetGuide: '$45 to $220/day depending on style',
    nearbyNote: 'Expect dense attraction clusters around the riverfront, Sukhumvit, and Old City.',
  },
  {
    id: 'phuket',
    slug: 'phuket',
    name: 'Phuket',
    countryId: 'thailand',
    countryCode: 'THA',
    countryName: 'Thailand',
    region: 'ASIA',
    heroImage: 'https://images.unsplash.com/photo-1578922746465-3f3c2d2a8a9e?auto=format&fit=crop&w=1400&q=80',
    description: 'Island scenery, beach clubs, boat tours, and laid-back holiday energy.',
    bestTime: 'November to April',
    travelStyle: ['Beach escape', 'Family friendly', 'Island hopping'],
    highlights: ['Beaches', 'Boat tours', 'Viewpoints', 'Night markets'],
    mapCenter: { lat: 7.8804, lng: 98.3923 },
    budgetGuide: '$50 to $300/day depending on resort choice',
    nearbyNote: 'Beach attractions are clustered around Patong, Kata, and the southern peninsula.',
  },
];

const ATTRACTIONS: DestinationAttraction[] = [
  {
    id: 'museum-of-the-future',
    slug: 'museum-of-the-future',
    name: 'Museum of the Future',
    citySlug: 'dubai',
    cityName: 'Dubai',
    countryCode: 'UAE',
    countryName: 'United Arab Emirates',
    category: 'Museums',
    rating: 4.9,
    reviewCount: 18240,
    entryFee: 149,
    currency: 'AED',
    openingHours: 'Daily 9:30 AM – 9:00 PM',
    tips: ['Book timed entry in advance', 'Go early for fewer crowds', 'Allow 90 minutes'],
    description: 'A futuristic museum focused on innovation, sustainability, and immersive exhibitions.',
    image: 'https://images.unsplash.com/photo-1580401607524-4f0e7e0ec1d2?auto=format&fit=crop&w=1200&q=80',
    bestFor: 'Tech lovers, families, and design enthusiasts',
    duration: '2 hours',
    bookingSource: 'Viator',
    bookingLink: 'https://www.viator.com/',
    latitude: 25.217,
    longitude: 55.282,
    nearbyAttractions: ['Dubai Frame', 'Zabeel Park', 'Downtown Dubai'],
    photos: [
      'https://images.unsplash.com/photo-1580401607524-4f0e7e0ec1d2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?auto=format&fit=crop&w=800&q=80',
    ],
    featured: true,
  },
  {
    id: 'jumeirah-beach',
    slug: 'jumeirah-beach',
    name: 'Jumeirah Beach',
    citySlug: 'dubai',
    cityName: 'Dubai',
    countryCode: 'UAE',
    countryName: 'United Arab Emirates',
    category: 'Beaches',
    rating: 4.7,
    reviewCount: 9102,
    entryFee: 0,
    currency: 'AED',
    openingHours: 'Open 24 hours',
    tips: ['Visit at sunset', 'Bring water and sunscreen', 'Pair with a marina dinner'],
    description: 'A popular beach stretch with skyline views and easy access to cafes and family facilities.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bestFor: 'Sunset lovers and relaxed beach days',
    duration: '3 hours',
    bookingSource: 'Local',
    bookingLink: 'https://www.google.com/maps',
    latitude: 25.1972,
    longitude: 55.2744,
    nearbyAttractions: ['Burj Al Arab', 'Madinat Jumeirah', 'Dubai Marina'],
    photos: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
  },
  {
    id: 'louvre-abu-dhabi',
    slug: 'louvre-abu-dhabi',
    name: 'Louvre Abu Dhabi',
    citySlug: 'abu-dhabi',
    cityName: 'Abu Dhabi',
    countryCode: 'UAE',
    countryName: 'United Arab Emirates',
    category: 'Museums',
    rating: 4.8,
    reviewCount: 7034,
    entryFee: 63,
    currency: 'AED',
    openingHours: 'Tue–Sun 10:00 AM – 6:30 PM',
    tips: ['Check the rotating exhibitions', 'Use the museum shuttle if available', 'Plan for a half-day visit'],
    description: 'A spectacular art museum with striking architecture and a globally curated collection.',
    image: 'https://images.unsplash.com/photo-1513279922550-250c2129b13a?auto=format&fit=crop&w=1200&q=80',
    bestFor: 'Art lovers and architecture fans',
    duration: '2.5 hours',
    bookingSource: 'GetYourGuide',
    bookingLink: 'https://www.getyourguide.com/',
    latitude: 24.533,
    longitude: 54.4002,
    nearbyAttractions: ['Saadiyat Beach', 'Manarat Al Saadiyat', 'TeamLab Phenomena'],
    photos: ['https://images.unsplash.com/photo-1513279922550-250c2129b13a?auto=format&fit=crop&w=800&q=80'],
    featured: true,
  },
  {
    id: 'grand-palace',
    slug: 'grand-palace',
    name: 'Grand Palace',
    citySlug: 'bangkok',
    cityName: 'Bangkok',
    countryCode: 'THA',
    countryName: 'Thailand',
    category: 'Museums',
    rating: 4.7,
    reviewCount: 16120,
    entryFee: 500,
    currency: 'THB',
    openingHours: 'Daily 8:30 AM – 3:30 PM',
    tips: ['Dress modestly', 'Arrive before crowds', 'Combine with Wat Pho'],
    description: 'A royal landmark and cultural highlight of Bangkok with ornate temple architecture.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
    bestFor: 'First-time visitors and cultural travelers',
    duration: '2 hours',
    bookingSource: 'Viator',
    bookingLink: 'https://www.viator.com/',
    latitude: 13.750,
    longitude: 100.491,
    nearbyAttractions: ['Wat Pho', 'Wat Arun', 'Chao Phraya River'],
    photos: ['https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80'],
    featured: true,
  },
  {
    id: 'bangkok-street-food',
    slug: 'bangkok-street-food',
    name: 'Bangkok Street Food Crawl',
    citySlug: 'bangkok',
    cityName: 'Bangkok',
    countryCode: 'THA',
    countryName: 'Thailand',
    category: 'Food Tours',
    rating: 4.9,
    reviewCount: 8421,
    entryFee: 39,
    currency: 'USD',
    openingHours: 'Evenings',
    tips: ['Come hungry', 'Use a local guide', 'Try both classics and seasonal dishes'],
    description: 'An evening food adventure through local markets and iconic street stalls.',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80',
    bestFor: 'Foodies and adventurous travelers',
    duration: '3 hours',
    bookingSource: 'GetYourGuide',
    bookingLink: 'https://www.getyourguide.com/',
    latitude: 13.7367,
    longitude: 100.5231,
    nearbyAttractions: ['Chinatown', 'Old Town', 'Riverfront Night Markets'],
    photos: ['https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80'],
  },
  {
    id: 'louvre-museum',
    slug: 'louvre-museum',
    name: 'Louvre Museum',
    citySlug: 'paris',
    cityName: 'Paris',
    countryCode: 'FRA',
    countryName: 'France',
    category: 'Museums',
    rating: 4.9,
    reviewCount: 25844,
    entryFee: 22,
    currency: 'EUR',
    openingHours: 'Wed–Mon 9:00 AM – 6:00 PM',
    tips: ['Pre-book tickets', 'Focus on one wing if short on time', 'Visit early or late'],
    description: 'The world-famous museum for art, archaeology, and iconic masterpieces.',
    image: 'https://images.unsplash.com/photo-1566127444979-1bf4d5c0d9b4?auto=format&fit=crop&w=1200&q=80',
    bestFor: 'Art lovers and first-time Paris visitors',
    duration: '3 hours',
    bookingSource: 'Viator',
    bookingLink: 'https://www.viator.com/',
    latitude: 48.8606,
    longitude: 2.3376,
    nearbyAttractions: ['Tuileries Garden', 'Seine River', 'Notre-Dame area'],
    photos: ['https://images.unsplash.com/photo-1566127444979-1bf4d5c0d9b4?auto=format&fit=crop&w=800&q=80'],
    featured: true,
  },
  {
    id: 'seine-cruise',
    slug: 'seine-cruise',
    name: 'Seine River Cruise',
    citySlug: 'paris',
    cityName: 'Paris',
    countryCode: 'FRA',
    countryName: 'France',
    category: 'Nightlife',
    rating: 4.6,
    reviewCount: 11870,
    entryFee: 28,
    currency: 'EUR',
    openingHours: 'Daily from 10:00 AM',
    tips: ['Choose sunset for best photos', 'Bring a light jacket', 'Pair with a dinner package'],
    description: 'A scenic river cruise with monument views and evening city lights.',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
    bestFor: 'Couples and easy sightseeing',
    duration: '1 hour',
    bookingSource: 'GetYourGuide',
    bookingLink: 'https://www.getyourguide.com/',
    latitude: 48.859,
    longitude: 2.346,
    nearbyAttractions: ['Eiffel Tower', 'Notre-Dame', 'Orsay Museum'],
    photos: ['https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80'],
  },
  {
    id: 'phuket-beaches',
    slug: 'phuket-beaches',
    name: 'Phuket Beaches & Viewpoints',
    citySlug: 'phuket',
    cityName: 'Phuket',
    countryCode: 'THA',
    countryName: 'Thailand',
    category: 'Beaches',
    rating: 4.8,
    reviewCount: 10210,
    entryFee: 0,
    currency: 'THB',
    openingHours: 'Open all day',
    tips: ['Plan a sunset stop', 'Rent a scooter only if experienced', 'Check surf and tide conditions'],
    description: 'A scenic beach-hopping route with viewpoints and relaxed island energy.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    bestFor: 'Island seekers and beach travelers',
    duration: 'Half day',
    bookingSource: 'Local',
    bookingLink: 'https://www.google.com/maps',
    latitude: 7.805,
    longitude: 98.297,
    nearbyAttractions: ['Kata Beach', 'Promthep Cape', 'Big Buddha'],
    photos: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'],
  },
];

const REVIEWS: Record<string, AttractionReview[]> = {
  'museum-of-the-future': [
    { id: 'r1', author: 'Sara', rating: 5, comment: 'Immersive, inspiring, and very family-friendly.', date: '2026-03-18', title: 'Best museum in Dubai' },
    { id: 'r2', author: 'Amir', rating: 4.8, comment: 'Worth booking early. The design alone is worth the visit.', date: '2026-02-21' },
  ],
  'louvre-museum': [
    { id: 'r3', author: 'Mina', rating: 5, comment: 'A dream for art lovers. Go early and take your time.', date: '2026-01-28', title: 'Must-see in Paris' },
    { id: 'r4', author: 'Noah', rating: 4.7, comment: 'Large but very rewarding, especially if you enjoy history.', date: '2026-02-12' },
  ],
  'bangkok-street-food': [
    { id: 'r5', author: 'Lina', rating: 5, comment: 'We tried so many dishes I lost count. Amazing guide too.', date: '2026-03-01', title: 'Food heaven' },
    { id: 'r6', author: 'Tariq', rating: 4.9, comment: 'A must-do if you want a local experience with zero planning.', date: '2026-03-12' },
  ],
};

const TOURS: Record<string, DestinationTour[]> = {
  'museum-of-the-future': [
    {
      id: 't1',
      provider: 'Viator',
      title: 'Museum of the Future entry with concierge support',
      duration: '2 hours',
      price: 149,
      currency: 'AED',
      bookingLink: 'https://www.viator.com/',
      highlights: ['Timed entry', 'Priority support', 'Flexible cancellation'],
    },
    {
      id: 't2',
      provider: 'GetYourGuide',
      title: 'Dubai skyline and future city walking tour',
      duration: '4 hours',
      price: 89,
      currency: 'AED',
      bookingLink: 'https://www.getyourguide.com/',
      highlights: ['Guided city walk', 'Photo stops', 'Local insights'],
    },
  ],
  'louvre-museum': [
    {
      id: 't3',
      provider: 'GetYourGuide',
      title: 'Louvre Museum reserved-entry tour',
      duration: '2.5 hours',
      price: 42,
      currency: 'EUR',
      bookingLink: 'https://www.getyourguide.com/',
      highlights: ['Reserved entry', 'Expert guide', 'Small group'],
    },
    {
      id: 't4',
      provider: 'Viator',
      title: 'Paris museum and river combo pass',
      duration: '5 hours',
      price: 89,
      currency: 'EUR',
      bookingLink: 'https://www.viator.com/',
      highlights: ['Museum access', 'River cruise', 'Best value bundle'],
    },
  ],
  'bangkok-street-food': [
    {
      id: 't5',
      provider: 'Local',
      title: 'Bangkok evening street food crawl',
      duration: '3 hours',
      price: 39,
      currency: 'USD',
      bookingLink: 'https://www.google.com/maps',
      highlights: ['Local guide', 'Food tastings', 'Market visit'],
    },
    {
      id: 't6',
      provider: 'GetYourGuide',
      title: 'Private Bangkok food and temple combo',
      duration: '5 hours',
      price: 74,
      currency: 'USD',
      bookingLink: 'https://www.getyourguide.com/',
      highlights: ['Private transfer', 'Temple stop', 'Food market tasting'],
    },
  ],
};

const WISHLIST: WishlistEntry[] = [
  {
    id: 'w1',
    attractionId: 'museum-of-the-future',
    name: 'Museum of the Future',
    city: 'Dubai',
    country: 'United Arab Emirates',
    category: 'Museums',
    image: ATTRACTIONS[0].image,
    savedAt: '2026-04-10',
  },
  {
    id: 'w2',
    attractionId: 'louvre-museum',
    name: 'Louvre Museum',
    city: 'Paris',
    country: 'France',
    category: 'Museums',
    image: ATTRACTIONS[5].image,
    savedAt: '2026-04-14',
  },
  {
    id: 'w3',
    attractionId: 'bangkok-street-food',
    name: 'Bangkok Street Food Crawl',
    city: 'Bangkok',
    country: 'Thailand',
    category: 'Food Tours',
    image: ATTRACTIONS[4].image,
    savedAt: '2026-04-16',
  },
];

export const DESTINATION_REGIONS: DestinationRegion[] = ['ASIA', 'EUROPE', 'MIDDLE EAST', 'AFRICA', 'AMERICAS', 'OCEANIA'];
export const DESTINATION_CATEGORIES: DestinationCategory[] = ['Museums', 'Beaches', 'Hiking', 'Nightlife', 'Shopping', 'Food Tours'];

export function listMockDestinations(): Array<DestinationCountry & {
  cities: DestinationCity[];
  topAttractions: DestinationAttraction[];
  clusters: MapCluster[];
  featuredEvents: DestinationEvent[];
}> {
  return COUNTRIES.map((country) => ({
    ...country,
    cities: CITIES.filter((city) => city.countryId === country.id),
    topAttractions: ATTRACTIONS.filter((item) => item.countryCode === country.code).slice(0, 6),
    clusters: getMockMapClustersByCountry(country.id),
    featuredEvents: country.seasonalEvents,
  }));
}

export function getMockCountry(country: string): DestinationCountry & {
  cities: DestinationCity[];
  topAttractions: DestinationAttraction[];
  clusters: MapCluster[];
  featuredEvents: DestinationEvent[];
} {
  const normalized = country.trim().toLowerCase();
  const current = COUNTRIES.find((item) => item.id === normalized || item.code.toLowerCase() === normalized) ?? COUNTRIES[0];
  const cities = CITIES.filter((city) => city.countryId === current.id);
  const topAttractions = ATTRACTIONS.filter((item) => item.countryCode === current.code).slice(0, 6);
  return {
    ...current,
    cities,
    topAttractions,
    clusters: getMockMapClustersByCountry(current.id),
    featuredEvents: current.seasonalEvents,
  };
}

export function getMockCity(slug: string): DestinationCity & {
  attractions: DestinationAttraction[];
  recommendations: AiRecommendation[];
  events: DestinationEvent[];
  clusters: MapCluster[];
} {
  const normalized = slug.trim().toLowerCase();
  const city = CITIES.find((item) => item.slug === normalized) ?? CITIES[0];
  const country = COUNTRIES.find((item) => item.id === city.countryId) ?? COUNTRIES[0];
  const attractions = ATTRACTIONS.filter((item) => item.citySlug === city.slug);
  const recommendations = getMockAiRecommendations(city.slug).slice(0, 5);
  return {
    ...city,
    attractions,
    recommendations,
    events: country.seasonalEvents,
    clusters: getMockMapClustersByCity(city.slug),
  };
}

export function listMockAttractions(query = ''): { data: DestinationAttraction[]; total: number } {
  const search = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
  const category = (search.get('category') ?? '').trim().toLowerCase();
  const city = (search.get('city') ?? '').trim().toLowerCase();
  const country = (search.get('country') ?? '').trim().toLowerCase();

  const data = ATTRACTIONS.filter((item) => {
    const matchesCategory = !category || category === 'all' || item.category.toLowerCase().includes(category);
    const matchesCity = !city || item.citySlug === city;
    const matchesCountry = !country || item.countryCode.toLowerCase() === country || item.countryName.toLowerCase() === country;
    return matchesCategory && matchesCity && matchesCountry;
  });

  return { data, total: data.length };
}

export function getMockAttraction(id: string): DestinationAttraction {
  const normalized = id.trim().toLowerCase();
  return ATTRACTIONS.find((item) => item.id === normalized || item.slug === normalized) ?? ATTRACTIONS[0];
}

export function getMockAttractionReviews(id: string): AttractionReview[] {
  return REVIEWS[getMockAttraction(id).id] ?? [
    { id: 'r-default-1', author: 'Ava', rating: 4.8, comment: 'A memorable stop with strong value and great views.', date: '2026-04-02' },
    { id: 'r-default-2', author: 'Jon', rating: 4.6, comment: 'Well organized and easy to fit into a day itinerary.', date: '2026-04-04' },
  ];
}

export function getMockAttractionTours(id: string): DestinationTour[] {
  return TOURS[getMockAttraction(id).id] ?? [
    {
      id: 't-default-1',
      provider: 'Local',
      title: `Guided visit for ${getMockAttraction(id).name}`,
      duration: getMockAttraction(id).duration,
      price: Math.max(15, getMockAttraction(id).entryFee + 20),
      currency: getMockAttraction(id).currency,
      bookingLink: 'https://www.google.com/maps',
      highlights: ['Fast booking', 'Flexible timing', 'Local guide'],
    },
  ];
}

export function getMockWishlist(): WishlistEntry[] {
  return WISHLIST;
}

export function getMockMapClusters(query = ''): MapCluster[] {
  const search = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
  const city = (search.get('city') ?? '').trim().toLowerCase();
  const country = (search.get('country') ?? '').trim().toLowerCase();

  if (city) {
    return getMockMapClustersByCity(city);
  }

  if (country) {
    return getMockMapClustersByCountry(country);
  }

  return [
    ...getMockMapClustersByCountry('uae'),
    ...getMockMapClustersByCountry('france'),
    ...getMockMapClustersByCountry('thailand'),
  ];
}

export function getMockAiRecommendations(city: string): AiRecommendation[] {
  const normalized = city.trim().toLowerCase();
  if (normalized === 'dubai') {
    return [
      { name: 'Museum of the Future', category: 'Museums', score: 98, reason: 'Strong match for innovation-focused travelers.', bestTime: 'Morning' },
      { name: 'Jumeirah Beach', category: 'Beaches', score: 94, reason: 'Fits sunset and relaxed travel preferences.', bestTime: 'Sunset' },
      { name: 'Dubai Creek Food Walk', category: 'Food Tours', score: 93, reason: 'Great for food-first travelers who like heritage areas.', bestTime: 'Late afternoon' },
      { name: 'Desert Safari', category: 'Hiking', score: 90, reason: 'Best for adventure seekers who want soft adventure.', bestTime: 'Evening' },
      { name: 'Dubai Marina Night Cruise', category: 'Nightlife', score: 88, reason: 'Pairs well with premium city-break itineraries.', bestTime: 'Evening' },
    ];
  }

  if (normalized === 'paris') {
    return [
      { name: 'Louvre Museum', category: 'Museums', score: 99, reason: 'Perfect for art and culture interests.', bestTime: 'Opening hour' },
      { name: 'Seine River Cruise', category: 'Nightlife', score: 91, reason: 'Great for scenic city experiences.', bestTime: 'Sunset' },
      { name: 'Montmartre Food Tour', category: 'Food Tours', score: 89, reason: 'Matches food and neighborhood exploration.', bestTime: 'Lunch' },
      { name: 'Luxembourg Gardens Walk', category: 'Hiking', score: 85, reason: 'Slow-travel friendly and easy to fit in.', bestTime: 'Morning' },
      { name: 'Paris Fashion District', category: 'Shopping', score: 83, reason: 'Ideal for style-focused travelers.', bestTime: 'Afternoon' },
    ];
  }

  if (normalized === 'bangkok') {
    return [
      { name: 'Grand Palace', category: 'Museums', score: 96, reason: 'Excellent cultural introduction to Bangkok.', bestTime: 'Early morning' },
      { name: 'Bangkok Street Food Crawl', category: 'Food Tours', score: 95, reason: 'A top match for food lovers and first-timers.', bestTime: 'Evening' },
      { name: 'Night Markets', category: 'Shopping', score: 90, reason: 'Strong for travelers who like lively local shopping.', bestTime: 'After 6 pm' },
      { name: 'Chao Phraya River Walk', category: 'Nightlife', score: 87, reason: 'Good for scenic city exploration.', bestTime: 'Sunset' },
      { name: 'Day Trip to Ayutthaya', category: 'Hiking', score: 84, reason: 'Best for travelers wanting a day outside the city.', bestTime: 'Morning' },
    ];
  }

  return [
    { name: 'Top city landmark', category: 'Museums', score: 90, reason: 'A reliable match for most travelers.', bestTime: 'Morning' },
    { name: 'Local food walk', category: 'Food Tours', score: 86, reason: 'Good for travelers who enjoy culture through food.', bestTime: 'Lunch' },
    { name: 'Scenic viewpoint', category: 'Hiking', score: 82, reason: 'Pairs well with flexible half-day itineraries.', bestTime: 'Sunset' },
    { name: 'Shopping district', category: 'Shopping', score: 78, reason: 'Best for casual browsing and souvenir hunts.', bestTime: 'Afternoon' },
    { name: 'Night experience', category: 'Nightlife', score: 75, reason: 'Useful when the traveler likes evening activities.', bestTime: 'Evening' },
  ];
}

export function getMockTopAttractions(payload: unknown): { top_5: Array<{ name: string; reason: string; best_time: string }> } {
  const interests = Array.isArray((payload as { interests?: unknown }).interests)
    ? ((payload as { interests?: string[] }).interests ?? [])
    : [];
  const city = typeof (payload as any)?.city === 'string' ? (payload as any).city : 'dubai';
  const matches = getMockAiRecommendations(city).slice(0, 5).map((item) => ({
    name: item.name,
    reason: `${item.reason}${interests.length ? ` Matches ${interests.join(', ')}.` : ''}`,
    best_time: item.bestTime,
  }));

  return { top_5: matches };
}

export function getDestinationBySlug(slug: string) {
  return getMockCity(slug);
}

function getMockMapClustersByCity(slug: string): MapCluster[] {
  const attractionList = ATTRACTIONS.filter((item) => item.citySlug === slug);
  return clusterAttractions(attractionList);
}

function getMockMapClustersByCountry(countryId: string): MapCluster[] {
  const attractionList = ATTRACTIONS.filter((item) => item.countryCode.toLowerCase() === countryId || item.countryName.toLowerCase() === countryId || item.countryCode.toLowerCase() === countryId.toLowerCase());
  return clusterAttractions(attractionList);
}

function clusterAttractions(attractions: DestinationAttraction[]): MapCluster[] {
  const buckets = new Map<string, MapCluster>();

  attractions.forEach((attraction) => {
    const latBucket = Math.round(attraction.latitude * 10) / 10;
    const lngBucket = Math.round(attraction.longitude * 10) / 10;
    const key = `${latBucket}:${lngBucket}`;
    const current = buckets.get(key) ?? { latBucket, lngBucket, count: 0 };
    current.count += 1;
    buckets.set(key, current);
  });

  return [...buckets.values()].sort((a, b) => b.count - a.count);
}
