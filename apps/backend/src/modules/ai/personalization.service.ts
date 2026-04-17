import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';

const Cron = (_expression: string): MethodDecorator => () => undefined;

export interface UserPreferencesML {
  id: string;
  userId: string;
  preferredDestinations: string[];
  preferredCabinClass: string;
  preferredAirlines: string[];
  preferredHotelStars: number;
  preferredHotelAmenities: string[];
  travelStyle: Record<string, number>;
  budgetTier: string;
  soloGroupPreference: string;
  lastComputedAt: string | null;
  updatedAt: string;
}

export interface Attraction {
  id: string;
  name: string;
  tags: string[];
  score?: number;
  explanation?: string;
}

export interface Destination {
  id: string;
  city: string;
  country?: string;
  score?: number;
}

@Injectable()
export class PersonalizationService {
  constructor(private readonly db: PostgresClient) {}

  async computeUserPreferences(userId: string): Promise<UserPreferencesML> {
    const rows = await this.db.query<{
      destination: string;
      cabin: string;
      airline: string;
      amount: number;
      isSolo: boolean;
    }>(
      `SELECT
         COALESCE(f.arrival_airport, h.city, 'unknown') as destination,
         COALESCE(lower(f.cabin_class), 'economy') as cabin,
         COALESCE(f.airline_code, 'mixed') as airline,
         b.total_amount::float8 as amount,
         (CASE WHEN t.id IS NULL THEN false ELSE true END) as "isSolo"
       FROM bookings b
       LEFT JOIN flights f ON f.id = b.flight_id
       LEFT JOIN hotels h ON h.id = b.hotel_id
       LEFT JOIN trips t ON t.id = b.trip_id
       WHERE b.user_id = $1
         AND b.created_at >= NOW() - INTERVAL '12 months'`,
      [userId],
    );

    const preferredDestinations = Array.from(new Set(rows.map((row) => row.destination))).filter((d) => d !== 'unknown').slice(0, 10);
    const preferredAirlines = Array.from(new Set(rows.map((row) => row.airline))).slice(0, 5);
    const preferredCabinClass = this.mode(rows.map((row) => row.cabin)) ?? 'economy';
    const avgBudget = rows.length ? rows.reduce((sum, row) => sum + Number(row.amount || 0), 0) / rows.length : 0;
    const budgetTier = avgBudget > 3000 ? 'luxury' : avgBudget < 800 ? 'budget' : 'mid_range';
    const soloGroupPreference = rows.filter((row) => row.isSolo).length >= rows.length / 2 ? 'solo' : 'couple';

    const travelStyle: Record<string, number> = {
      adventure: 0.4,
      culture: 0.4,
      beach: preferredDestinations.some((d) => ['DPS', 'MLE', 'BKK', 'HNL'].includes(d.toUpperCase())) ? 0.8 : 0.3,
      nightlife: preferredDestinations.some((d) => ['DXB', 'LON', 'NYC'].includes(d.toUpperCase())) ? 0.7 : 0.3,
      food: 0.6,
    };

    const saved = await this.db.queryOne<UserPreferencesML>(
      `INSERT INTO user_preferences_ml (
         user_id,
         preferred_destinations,
         preferred_cabin_class,
         preferred_airlines,
         preferred_hotel_stars,
         preferred_hotel_amenities,
         travel_style,
         budget_tier,
         solo_group_preference,
         last_computed_at,
         updated_at
       )
       VALUES ($1, $2::jsonb, $3, $4::jsonb, $5, $6::jsonb, $7::jsonb, $8, $9, NOW(), NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         preferred_destinations = EXCLUDED.preferred_destinations,
         preferred_cabin_class = EXCLUDED.preferred_cabin_class,
         preferred_airlines = EXCLUDED.preferred_airlines,
         preferred_hotel_stars = EXCLUDED.preferred_hotel_stars,
         preferred_hotel_amenities = EXCLUDED.preferred_hotel_amenities,
         travel_style = EXCLUDED.travel_style,
         budget_tier = EXCLUDED.budget_tier,
         solo_group_preference = EXCLUDED.solo_group_preference,
         last_computed_at = NOW(),
         updated_at = NOW()
       RETURNING
         id,
         user_id as "userId",
         preferred_destinations as "preferredDestinations",
         preferred_cabin_class as "preferredCabinClass",
         preferred_airlines as "preferredAirlines",
         preferred_hotel_stars as "preferredHotelStars",
         preferred_hotel_amenities as "preferredHotelAmenities",
         travel_style as "travelStyle",
         budget_tier as "budgetTier",
         solo_group_preference as "soloGroupPreference",
         last_computed_at as "lastComputedAt",
         updated_at as "updatedAt"`,
      [
        userId,
        JSON.stringify(preferredDestinations),
        preferredCabinClass,
        JSON.stringify(preferredAirlines),
        4,
        JSON.stringify(['wifi', 'breakfast']),
        JSON.stringify(travelStyle),
        budgetTier,
        soloGroupPreference,
      ],
    );

    if (!saved) {
      throw new Error('Failed to compute preferences');
    }

    return saved;
  }

  @Cron('0 3 * * 0')
  async weeklyPreferenceRefresh(): Promise<void> {
    const users = await this.db.query<{ id: string }>('SELECT id FROM users');
    await Promise.all(users.map((user) => this.computeUserPreferences(user.id)));
  }

  async rankAttractions(userId: string, attractions: Attraction[]): Promise<Attraction[]> {
    const preference = await this.fetchOrComputePreferences(userId);
    const style = preference.travelStyle ?? {};

    return attractions
      .map((attraction) => {
        const score = attraction.tags.reduce((sum, tag) => sum + (style[tag] ?? 0.1), 0);
        return {
          ...attraction,
          score,
          explanation: 'Ranked for you based on your love of beaches and culture',
        };
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  async getPersonalizedDestinations(userId: string, limit = 5): Promise<Destination[]> {
    const preference = await this.fetchOrComputePreferences(userId);
    const recentlyVisited = await this.db.query<{ destination: string }>(
      `SELECT COALESCE(f.arrival_airport, h.city) AS destination
       FROM bookings b
       LEFT JOIN flights f ON f.id = b.flight_id
       LEFT JOIN hotels h ON h.id = b.hotel_id
       WHERE b.user_id = $1
         AND b.created_at >= NOW() - INTERVAL '6 months'`,
      [userId],
    );

    const recentSet = new Set(recentlyVisited.map((row) => row.destination));
    const destinations = preference.preferredDestinations
      .filter((destination) => !recentSet.has(destination))
      .slice(0, limit)
      .map((destination, idx) => ({ id: `${destination}-${idx}`, city: destination, score: 1 - idx * 0.05 }));

    return destinations;
  }

  private async fetchOrComputePreferences(userId: string): Promise<UserPreferencesML> {
    const pref = await this.db.queryOne<UserPreferencesML>(
      `SELECT
         id,
         user_id as "userId",
         preferred_destinations as "preferredDestinations",
         preferred_cabin_class as "preferredCabinClass",
         preferred_airlines as "preferredAirlines",
         preferred_hotel_stars as "preferredHotelStars",
         preferred_hotel_amenities as "preferredHotelAmenities",
         travel_style as "travelStyle",
         budget_tier as "budgetTier",
         solo_group_preference as "soloGroupPreference",
         last_computed_at as "lastComputedAt",
         updated_at as "updatedAt"
       FROM user_preferences_ml
       WHERE user_id = $1`,
      [userId],
    );

    if (pref) {
      return pref;
    }

    return this.computeUserPreferences(userId);
  }

  private mode(values: string[]): string | null {
    if (!values.length) {
      return null;
    }

    const count = values.reduce<Record<string, number>>((acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }
}
