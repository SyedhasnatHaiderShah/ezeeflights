import { Pool } from 'pg';

// Derive the PoolClient type from Pool.connect() to avoid TS2709 (namespace vs type conflict in @types/pg)
type PgPoolClient = Awaited<ReturnType<Pool['connect']>>;
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

type CountrySeed = {
  name: string;
  code: string;
  region: string;
  description: string;
  heroImage: string;
};

type CitySeed = {
  name: string;
  slug: string;
  countryCode: string;
  description: string;
  latitude: number;
  longitude: number;
  heroImage: string;
  isFeatured: boolean;
};

type AttractionSeed = {
  citySlug: string;
  name: string;
  slug: string;
  description: string;
  category: 'museum' | 'beach' | 'hiking' | 'nightlife' | 'shopping' | 'food';
  latitude: number;
  longitude: number;
  entryFee: number;
  openingHours: string;
  tips: string;
  rating: number;
  totalReviews: number;
  images: string[];
};

type EventSeed = {
  citySlug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
};

type PackageSeed = {
  title: string;
  slug: string;
  description: string;
  destination: string;
  country: string;
  durationDays: number;
  basePrice: number;
  currency: 'USD' | 'AED' | 'EUR' | 'GBP';
  thumbnailUrl: string;
  status: 'published' | 'draft' | 'archived';
  pricing: { adultPrice: number; childPrice: number; infantPrice: number };
  inclusions: Array<{ type: 'flight' | 'hotel' | 'meal' | 'activity' | 'transfer'; description: string }>;
  exclusions: string[];
  itinerary: Array<{ dayNumber: number; title: string; description: string }>;
  linkedAttractionSlugs: string[];
};

const countries: CountrySeed[] = [
  {
    name: 'United Arab Emirates',
    code: 'ARE',
    region: 'MIDDLE EAST',
    description: 'Luxury shopping, desert adventures, and iconic skylines.',
    heroImage:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1600',
  },
  {
    name: 'United Kingdom',
    code: 'GBR',
    region: 'EUROPE',
    description: 'Historic landmarks, rich culture, and timeless cities.',
    heroImage:
      'https://images.unsplash.com/photo-1488747279002-c8523379faaa?auto=format&fit=crop&q=80&w=1600',
  },
  {
    name: 'France',
    code: 'FRA',
    region: 'EUROPE',
    description: 'Romantic streets, world-class cuisine, and artful heritage.',
    heroImage:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1600',
  },
  {
    name: 'Thailand',
    code: 'THA',
    region: 'ASIA',
    description: 'Tropical beaches, vibrant nightlife, and temple culture.',
    heroImage:
      'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=1600',
  },
  {
    name: 'United States',
    code: 'USA',
    region: 'AMERICAS',
    description: 'Legendary cities, entertainment capitals, and diverse travel.',
    heroImage:
      'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&q=80&w=1600',
  },
];

const cities: CitySeed[] = [
  {
    name: 'Dubai',
    slug: 'dubai',
    countryCode: 'ARE',
    description: 'A futuristic desert metropolis known for luxury and adventure.',
    latitude: 25.204849,
    longitude: 55.270783,
    heroImage:
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1200',
    isFeatured: true,
  },
  {
    name: 'London',
    slug: 'london',
    countryCode: 'GBR',
    description: 'Classic architecture, theatre, and global culinary scenes.',
    latitude: 51.507351,
    longitude: -0.127758,
    heroImage:
      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&q=80&w=1200',
    isFeatured: true,
  },
  {
    name: 'Paris',
    slug: 'paris',
    countryCode: 'FRA',
    description: 'Elegant boulevards, iconic monuments, and unforgettable art.',
    latitude: 48.856613,
    longitude: 2.352222,
    heroImage:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1200',
    isFeatured: true,
  },
  {
    name: 'Bangkok',
    slug: 'bangkok',
    countryCode: 'THA',
    description: 'Street food heaven with golden temples and buzzing markets.',
    latitude: 13.756331,
    longitude: 100.501762,
    heroImage:
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&q=80&w=1200',
    isFeatured: true,
  },
  {
    name: 'New York',
    slug: 'new-york',
    countryCode: 'USA',
    description: 'Skyline views, Broadway lights, and endless city energy.',
    latitude: 40.712776,
    longitude: -74.005974,
    heroImage:
      'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&q=80&w=1200',
    isFeatured: true,
  },
];

const attractions: AttractionSeed[] = [
  {
    citySlug: 'dubai',
    name: 'Burj Khalifa',
    slug: 'burj-khalifa',
    description: 'The tallest building in the world with panoramic observation decks.',
    category: 'nightlife',
    latitude: 25.197197,
    longitude: 55.274376,
    entryFee: 45,
    openingHours: '10:00 AM - 11:00 PM',
    tips: 'Book sunset slots early for the best skyline views.',
    rating: 4.9,
    totalReviews: 18420,
    images: [
      'https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200',
    ],
  },
  {
    citySlug: 'london',
    name: 'British Museum',
    slug: 'british-museum',
    description: 'One of the largest museums showcasing human history and culture.',
    category: 'museum',
    latitude: 51.519413,
    longitude: -0.126957,
    entryFee: 0,
    openingHours: '10:00 AM - 5:00 PM',
    tips: 'Go early and start with the Egyptian and Greek galleries.',
    rating: 4.8,
    totalReviews: 14210,
    images: [
      'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&q=80&w=1200',
    ],
  },
  {
    citySlug: 'paris',
    name: 'Louvre Museum',
    slug: 'louvre-museum',
    description: 'World-famous museum home to the Mona Lisa and classical masterpieces.',
    category: 'museum',
    latitude: 48.860611,
    longitude: 2.337644,
    entryFee: 22,
    openingHours: '9:00 AM - 6:00 PM',
    tips: 'Use timed tickets and enter from Carrousel du Louvre for faster access.',
    rating: 4.9,
    totalReviews: 22105,
    images: [
      'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&q=80&w=1200',
    ],
  },
  {
    citySlug: 'bangkok',
    name: 'Chatuchak Market',
    slug: 'chatuchak-market',
    description: 'Huge weekend market with fashion, food, decor, and souvenirs.',
    category: 'shopping',
    latitude: 13.799999,
    longitude: 100.550003,
    entryFee: 0,
    openingHours: '9:00 AM - 6:00 PM',
    tips: 'Carry cash and arrive before noon to avoid heavy crowds.',
    rating: 4.6,
    totalReviews: 9800,
    images: [
      'https://images.unsplash.com/photo-1569288063648-5d7f6f651350?auto=format&fit=crop&q=80&w=1200',
    ],
  },
  {
    citySlug: 'new-york',
    name: 'Statue of Liberty',
    slug: 'statue-of-liberty',
    description: 'A symbol of freedom and one of the most iconic landmarks in the USA.',
    category: 'museum',
    latitude: 40.689247,
    longitude: -74.044502,
    entryFee: 24,
    openingHours: '9:00 AM - 5:00 PM',
    tips: 'Reserve crown access weeks in advance during peak season.',
    rating: 4.8,
    totalReviews: 19600,
    images: [
      'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&q=80&w=1200',
    ],
  },
];

const events: EventSeed[] = [
  {
    citySlug: 'dubai',
    title: 'Dubai Shopping Festival',
    description: 'Citywide shopping offers, fireworks, and entertainment shows.',
    startDate: '2026-01-05',
    endDate: '2026-01-28',
  },
  {
    citySlug: 'london',
    title: 'London Summer Music Week',
    description: 'Open-air concerts and live performances across city venues.',
    startDate: '2026-07-10',
    endDate: '2026-07-17',
  },
  {
    citySlug: 'paris',
    title: 'Paris Lights Festival',
    description: 'Night installations, light art, and cultural performances.',
    startDate: '2026-09-12',
    endDate: '2026-09-20',
  },
];

const packages: PackageSeed[] = [
  {
    title: 'Dubai Luxury Escape',
    slug: 'dubai-luxury-escape',
    description:
      '5-day premium Dubai trip with skyline hotel stay, desert safari, and iconic city attractions.',
    destination: 'Dubai',
    country: 'United Arab Emirates',
    durationDays: 5,
    basePrice: 1299,
    currency: 'USD',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1200',
    status: 'published',
    pricing: {
      adultPrice: 1299,
      childPrice: 999,
      infantPrice: 199,
    },
    inclusions: [
      { type: 'flight', description: 'Round-trip economy flight tickets' },
      { type: 'hotel', description: '4-star hotel stay with breakfast' },
      { type: 'activity', description: 'Evening desert safari with dinner' },
      { type: 'transfer', description: 'Airport pickup and drop-off transfers' },
    ],
    exclusions: ['Visa fee', 'Personal expenses', 'Travel insurance'],
    itinerary: [
      { dayNumber: 1, title: 'Arrival in Dubai', description: 'Airport transfer and check-in with evening marina walk.' },
      { dayNumber: 2, title: 'Downtown Highlights', description: 'Visit Burj Khalifa and Dubai Mall with fountain show.' },
      { dayNumber: 3, title: 'Desert Adventure', description: 'Desert safari with dune bashing and BBQ dinner.' },
      { dayNumber: 4, title: 'Palm & Beach Leisure', description: 'Palm Jumeirah photo tour and leisure beach time.' },
      { dayNumber: 5, title: 'Departure', description: 'Checkout and airport transfer for return flight.' },
    ],
    linkedAttractionSlugs: ['burj-khalifa'],
  },
  {
    title: 'Paris & London Twin City',
    slug: 'paris-london-twin-city',
    description:
      '7-day Europe plan covering Paris and London with guided tours and high-speed train transfer.',
    destination: 'Paris',
    country: 'France',
    durationDays: 7,
    basePrice: 1849,
    currency: 'USD',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1200',
    status: 'published',
    pricing: {
      adultPrice: 1849,
      childPrice: 1499,
      infantPrice: 249,
    },
    inclusions: [
      { type: 'flight', description: 'Open-jaw flight: home to Paris and return from London' },
      { type: 'hotel', description: 'Central hotels in Paris and London with breakfast' },
      { type: 'transfer', description: 'Eurostar standard class ticket between Paris and London' },
      { type: 'activity', description: 'Guided city tours in both cities' },
    ],
    exclusions: ['Lunch and dinner', 'City tax', 'Optional excursions'],
    itinerary: [
      { dayNumber: 1, title: 'Arrive in Paris', description: 'Check in and evening Seine river cruise.' },
      { dayNumber: 2, title: 'Classic Paris', description: 'Louvre visit and Eiffel Tower district walk.' },
      { dayNumber: 3, title: 'Paris Leisure', description: 'Free day for cafes and shopping.' },
      { dayNumber: 4, title: 'Travel to London', description: 'Morning Eurostar transfer and hotel check-in.' },
      { dayNumber: 5, title: 'London Landmarks', description: 'Buckingham, Westminster, and Thames highlights.' },
      { dayNumber: 6, title: 'Museums & Markets', description: 'British Museum and Covent Garden evening.' },
      { dayNumber: 7, title: 'Departure', description: 'Airport transfer and return flight.' },
    ],
    linkedAttractionSlugs: ['louvre-museum', 'british-museum'],
  },
  {
    title: 'Bangkok Shopper Getaway',
    slug: 'bangkok-shopper-getaway',
    description:
      '4-day Thailand city break focused on food tours, shopping streets, and local culture.',
    destination: 'Bangkok',
    country: 'Thailand',
    durationDays: 4,
    basePrice: 899,
    currency: 'USD',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&q=80&w=1200',
    status: 'published',
    pricing: {
      adultPrice: 899,
      childPrice: 699,
      infantPrice: 149,
    },
    inclusions: [
      { type: 'flight', description: 'Round-trip economy class flights' },
      { type: 'hotel', description: '3-star hotel in Sukhumvit area' },
      { type: 'activity', description: 'Street food and night market walking tour' },
      { type: 'transfer', description: 'Airport to hotel round-trip transfer' },
    ],
    exclusions: ['Checked baggage upgrade', 'Personal shopping expenses'],
    itinerary: [
      { dayNumber: 1, title: 'Arrival and Check-in', description: 'Airport transfer and evening local market visit.' },
      { dayNumber: 2, title: 'City Culture Day', description: 'Temple visits and old city tuk-tuk tour.' },
      { dayNumber: 3, title: 'Shopping & Food Trail', description: 'Chatuchak and street food route.' },
      { dayNumber: 4, title: 'Departure', description: 'Hotel checkout and transfer to airport.' },
    ],
    linkedAttractionSlugs: ['chatuchak-market'],
  },
  {
    title: 'New York Iconic Week',
    slug: 'new-york-iconic-week',
    description:
      '6-day NYC itinerary featuring classic landmarks, broadway district, and skyline experiences.',
    destination: 'New York',
    country: 'United States',
    durationDays: 6,
    basePrice: 1699,
    currency: 'USD',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&q=80&w=1200',
    status: 'published',
    pricing: {
      adultPrice: 1699,
      childPrice: 1399,
      infantPrice: 299,
    },
    inclusions: [
      { type: 'flight', description: 'Round-trip flight from selected hub city' },
      { type: 'hotel', description: 'Midtown Manhattan hotel stay' },
      { type: 'activity', description: 'Statue of Liberty and Ellis Island ferry ticket' },
      { type: 'transfer', description: 'Shared airport transfers' },
    ],
    exclusions: ['Visa processing fee', 'Resort fees', 'Optional broadway tickets'],
    itinerary: [
      { dayNumber: 1, title: 'Welcome to NYC', description: 'Arrival and Times Square evening.' },
      { dayNumber: 2, title: 'Lower Manhattan', description: 'Financial district and ferry to Statue of Liberty.' },
      { dayNumber: 3, title: 'City Classics', description: 'Central Park and museum mile.' },
      { dayNumber: 4, title: 'Brooklyn Day', description: 'DUMBO, bridge walk, and waterfront views.' },
      { dayNumber: 5, title: 'Leisure & Shopping', description: 'Free day for shopping and optional city pass sites.' },
      { dayNumber: 6, title: 'Departure', description: 'Checkout and transfer to airport.' },
    ],
    linkedAttractionSlugs: ['statue-of-liberty'],
  },
];

async function upsertCountry(client: PgPoolClient, country: CountrySeed): Promise<string> {
  const result = await client.query<{ id: string }>(
    `INSERT INTO countries (name, code, description, region, hero_image)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (code)
     DO UPDATE SET
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       region = EXCLUDED.region,
       hero_image = EXCLUDED.hero_image
     RETURNING id`,
    [country.name, country.code, country.description, country.region, country.heroImage],
  );

  return result.rows[0].id;
}

async function upsertCity(client: PgPoolClient, city: CitySeed, countryId: string): Promise<string> {
  const result = await client.query<{ id: string }>(
    `INSERT INTO cities (country_id, name, slug, description, latitude, longitude, hero_image, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (slug)
     DO UPDATE SET
       country_id = EXCLUDED.country_id,
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       hero_image = EXCLUDED.hero_image,
       is_featured = EXCLUDED.is_featured
     RETURNING id`,
    [countryId, city.name, city.slug, city.description, city.latitude, city.longitude, city.heroImage, city.isFeatured],
  );

  return result.rows[0].id;
}

async function upsertAttraction(client: PgPoolClient, attraction: AttractionSeed, cityId: string): Promise<string> {
  const result = await client.query<{ id: string }>(
    `INSERT INTO attractions
      (city_id, name, slug, description, category, latitude, longitude, entry_fee, opening_hours, tips, rating, total_reviews)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (city_id, slug)
     DO UPDATE SET
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       category = EXCLUDED.category,
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       entry_fee = EXCLUDED.entry_fee,
       opening_hours = EXCLUDED.opening_hours,
       tips = EXCLUDED.tips,
       rating = EXCLUDED.rating,
       total_reviews = EXCLUDED.total_reviews
     RETURNING id`,
    [
      cityId,
      attraction.name,
      attraction.slug,
      attraction.description,
      attraction.category,
      attraction.latitude,
      attraction.longitude,
      attraction.entryFee,
      attraction.openingHours,
      attraction.tips,
      attraction.rating,
      attraction.totalReviews,
    ],
  );

  const attractionId = result.rows[0].id;

  await client.query('DELETE FROM attraction_images WHERE attraction_id = $1', [attractionId]);
  for (const imageUrl of attraction.images) {
    await client.query(
      `INSERT INTO attraction_images (attraction_id, image_url)
       VALUES ($1, $2)`,
      [attractionId, imageUrl],
    );
  }

  return attractionId;
}

async function upsertEvent(client: PgPoolClient, event: EventSeed, cityId: string): Promise<void> {
  await client.query(`DELETE FROM events WHERE city_id = $1 AND title = $2`, [cityId, event.title]);
  await client.query(
    `INSERT INTO events (city_id, title, description, start_date, end_date)
     VALUES ($1, $2, $3, $4::date, $5::date)`,
    [cityId, event.title, event.description, event.startDate, event.endDate],
  );
}

async function upsertPackage(client: PgPoolClient, pkg: PackageSeed, createdBy: string): Promise<string> {
  const packageResult = await client.query<{ id: string }>(
    `INSERT INTO packages
      (title, slug, description, destination, country, duration_days, base_price, currency, thumbnail_url, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (slug)
     DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       destination = EXCLUDED.destination,
       country = EXCLUDED.country,
       duration_days = EXCLUDED.duration_days,
       base_price = EXCLUDED.base_price,
       currency = EXCLUDED.currency,
       thumbnail_url = EXCLUDED.thumbnail_url,
       status = EXCLUDED.status,
       updated_at = NOW()
     RETURNING id`,
    [
      pkg.title,
      pkg.slug,
      pkg.description,
      pkg.destination,
      pkg.country,
      pkg.durationDays,
      pkg.basePrice,
      pkg.currency,
      pkg.thumbnailUrl,
      pkg.status,
      createdBy,
    ],
  );

  const packageId = packageResult.rows[0].id;

  await client.query(
    `INSERT INTO package_pricing (package_id, adult_price, child_price, infant_price)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (package_id)
     DO UPDATE SET
       adult_price = EXCLUDED.adult_price,
       child_price = EXCLUDED.child_price,
       infant_price = EXCLUDED.infant_price`,
    [packageId, pkg.pricing.adultPrice, pkg.pricing.childPrice, pkg.pricing.infantPrice],
  );

  await client.query('DELETE FROM package_inclusions WHERE package_id = $1', [packageId]);
  for (const inclusion of pkg.inclusions) {
    await client.query(
      `INSERT INTO package_inclusions (package_id, type, description)
       VALUES ($1, $2, $3)`,
      [packageId, inclusion.type, inclusion.description],
    );
  }

  await client.query('DELETE FROM package_exclusions WHERE package_id = $1', [packageId]);
  for (const exclusion of pkg.exclusions) {
    await client.query(
      `INSERT INTO package_exclusions (package_id, description)
       VALUES ($1, $2)`,
      [packageId, exclusion],
    );
  }

  await client.query('DELETE FROM package_itineraries WHERE package_id = $1', [packageId]);
  for (const day of pkg.itinerary) {
    await client.query(
      `INSERT INTO package_itineraries (package_id, day_number, title, description)
       VALUES ($1, $2, $3, $4)`,
      [packageId, day.dayNumber, day.title, day.description],
    );
  }

  return packageId;
}

async function resolveSeedUserId(client: PgPoolClient): Promise<string> {
  const byAdminEmail = await client.query<{ id: string }>(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    ['admin@ezeeflights.com'],
  );
  if (byAdminEmail.rows[0]) {
    return byAdminEmail.rows[0].id;
  }

  const anyUser = await client.query<{ id: string }>('SELECT id FROM users ORDER BY created_at ASC LIMIT 1');
  if (anyUser.rows[0]) {
    return anyUser.rows[0].id;
  }

  throw new Error('No users found. Start backend once to create seed users, then run this script.');
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in apps/backend/.env');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log('🌱 Running destination + packages mock seed...');
    await client.query('BEGIN');

    const countryIdByCode = new Map<string, string>();
    for (const country of countries) {
      const countryId = await upsertCountry(client, country);
      countryIdByCode.set(country.code, countryId);
    }

    const cityIdBySlug = new Map<string, string>();
    for (const city of cities) {
      const countryId = countryIdByCode.get(city.countryCode);
      if (!countryId) {
        throw new Error(`Country not found for city ${city.name}`);
      }
      const cityId = await upsertCity(client, city, countryId);
      cityIdBySlug.set(city.slug, cityId);
    }

    const attractionIdBySlug = new Map<string, string>();
    for (const attraction of attractions) {
      const cityId = cityIdBySlug.get(attraction.citySlug);
      if (!cityId) {
        throw new Error(`City not found for attraction ${attraction.name}`);
      }
      const attractionId = await upsertAttraction(client, attraction, cityId);
      attractionIdBySlug.set(attraction.slug, attractionId);
    }

    for (const event of events) {
      const cityId = cityIdBySlug.get(event.citySlug);
      if (!cityId) {
        throw new Error(`City not found for event ${event.title}`);
      }
      await upsertEvent(client, event, cityId);
    }

    const createdBy = await resolveSeedUserId(client);

    for (const pkg of packages) {
      const packageId = await upsertPackage(client, pkg, createdBy);

      for (const attractionSlug of pkg.linkedAttractionSlugs) {
        const attractionId = attractionIdBySlug.get(attractionSlug);
        if (!attractionId) {
          continue;
        }

        await client.query(
          `INSERT INTO attraction_package_links (attraction_id, package_id)
           VALUES ($1, $2)
           ON CONFLICT (attraction_id, package_id) DO NOTHING`,
          [attractionId, packageId],
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Mock seed completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Mock seed failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

void main();
