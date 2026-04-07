import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { SavedTravelerEntity, UserProfileEntity } from '../entities/profile.entity';

const PROFILE_COLUMNS = `id,
  user_id as "userId",
  first_name as "firstName",
  last_name as "lastName",
  phone,
  date_of_birth::text as "dateOfBirth",
  gender,
  passport_number as "passportNumber",
  nationality,
  preferences,
  created_at as "createdAt",
  updated_at as "updatedAt"`;

@Injectable()
export class ProfileRepository {
  constructor(private readonly db: PostgresClient) {}

  findByUserId(userId: string): Promise<UserProfileEntity | null> {
    return this.db.queryOne<UserProfileEntity>(`SELECT ${PROFILE_COLUMNS} FROM user_profiles WHERE user_id = $1`, [userId]);
  }

  async upsert(userId: string, payload: Partial<UserProfileEntity>): Promise<UserProfileEntity> {
    const row = await this.db.queryOne<UserProfileEntity>(
      `INSERT INTO user_profiles (
          user_id, first_name, last_name, phone, date_of_birth, gender, passport_number, nationality, preferences
       ) VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, COALESCE($9::jsonb, '{}'::jsonb))
       ON CONFLICT (user_id) DO UPDATE SET
          first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
          last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
          phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
          date_of_birth = COALESCE(EXCLUDED.date_of_birth, user_profiles.date_of_birth),
          gender = COALESCE(EXCLUDED.gender, user_profiles.gender),
          passport_number = COALESCE(EXCLUDED.passport_number, user_profiles.passport_number),
          nationality = COALESCE(EXCLUDED.nationality, user_profiles.nationality),
          preferences = user_profiles.preferences || COALESCE(EXCLUDED.preferences, '{}'::jsonb),
          updated_at = NOW()
       RETURNING ${PROFILE_COLUMNS}`,
      [
        userId,
        payload.firstName ?? null,
        payload.lastName ?? null,
        payload.phone ?? null,
        payload.dateOfBirth ?? null,
        payload.gender ?? null,
        payload.passportNumber ?? null,
        payload.nationality ?? null,
        payload.preferences ? JSON.stringify(payload.preferences) : null,
      ],
    );

    if (!row) {
      throw new Error('Unable to upsert profile');
    }
    return row;
  }

  addTraveler(userId: string, payload: Omit<SavedTravelerEntity, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
    return this.db.queryOne<SavedTravelerEntity>(
      `INSERT INTO saved_travelers (user_id, full_name, passport_number, dob, nationality)
       VALUES ($1, $2, $3, $4::date, $5)
       RETURNING id, user_id as "userId", full_name as "fullName", passport_number as "passportNumber", dob::text as dob,
         nationality, created_at as "createdAt", updated_at as "updatedAt"`,
      [userId, payload.fullName, payload.passportNumber, payload.dob, payload.nationality],
    );
  }

  updateTraveler(
    userId: string,
    travelerId: string,
    payload: Omit<SavedTravelerEntity, 'id' | 'createdAt' | 'updatedAt' | 'userId'>,
  ) {
    return this.db.queryOne<SavedTravelerEntity>(
      `UPDATE saved_travelers
         SET full_name=$1, passport_number=$2, dob=$3::date, nationality=$4, updated_at=NOW()
       WHERE id=$5 AND user_id=$6
       RETURNING id, user_id as "userId", full_name as "fullName", passport_number as "passportNumber", dob::text as dob,
         nationality, created_at as "createdAt", updated_at as "updatedAt"`,
      [payload.fullName, payload.passportNumber, payload.dob, payload.nationality, travelerId, userId],
    );
  }

  deleteTraveler(userId: string, travelerId: string) {
    return this.db.queryOne<{ id: string }>('DELETE FROM saved_travelers WHERE id = $1 AND user_id = $2 RETURNING id', [
      travelerId,
      userId,
    ]);
  }

  listTravelers(userId: string) {
    return this.db.query<SavedTravelerEntity>(
      `SELECT id, user_id as "userId", full_name as "fullName", passport_number as "passportNumber", dob::text as dob,
        nationality, created_at as "createdAt", updated_at as "updatedAt"
       FROM saved_travelers WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
  }

  findTravelerByPassport(userId: string, passportNumber: string) {
    return this.db.queryOne<{ id: string }>(
      'SELECT id FROM saved_travelers WHERE user_id = $1 AND passport_number = $2 LIMIT 1',
      [userId, passportNumber],
    );
  }
}
