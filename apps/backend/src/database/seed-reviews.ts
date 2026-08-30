import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

const PUBLIC_REVIEWS_SEED = [
  {
    name: "Nancy",
    location: "US",
    rating: 5,
    date: "2025-06-06",
    text: "Ezee is a perfect name because they make life SO easy for their clients. I have worked with Elena for several years & she is polite, efficient & has gotten us fabulous fares. We travel to the same place annually & as soon as we get home she gets in touch with us to confirm our dates for the following year. I highly recommend them & will continue to use their excellent services!",
  },
  {
    name: "Samantha Richards",
    location: "US",
    rating: 5,
    date: "2025-08-02",
    text: "Absolutely wonderful experience! I worked with Nick to book 2 round trip tickets to Montego Bay Jamaica and everything went smoothly. I was very skeptical at first but Nick reassured me that the site was legit and was able to secure my tickets within 24 hours at $300 less than the price quoted by the airline. I will definitely work here again for future travel!",
  },
  {
    name: "Venu Sood",
    location: "UK",
    rating: 5,
    date: "2025-12-19",
    text: "Well impressed not a typical company that takes your money and leaves you in the lurch. Remus found me the perfect flight at the right price even though it was during absolute peak season and last minute. Would highly recommend Ezee Flights.",
  },
  {
    name: "Lourdes Santiago",
    location: "US",
    rating: 5,
    date: "2025-11-26",
    text: "I worked with Mr. Cruz & I can't believe how quick and easy the process was! With sky rocket prices to travel in the month of December to my motherland, Mr. Cruz understood my needs and made sure he met them! He was extremely patient and very attentive to my detailed demands and questions! I would highly recommend him to anyone that may need to purchase flights this upcoming holiday!",
  },
  {
    name: "Melissa Rodriguez",
    location: "US",
    rating: 4.8,
    date: "2025-12-05",
    text: "Ezee Flights is my go to flight agency when in need of an airline ticket! I usually contact Miguel, and he's always very efficient and reliable! I usually travel back during the holidays, which is a very busy and expensive time of the year! Thanks to Miguel I get the best airfare at my convenience! He also makes sure I have a confirmation to my itinerary within a 24 hr time period.",
  },
];

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in apps/backend/.env');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const tableExists = await pool.query(`SELECT to_regclass('public.public_reviews') AS exists`);
    const tableName = tableExists.rows[0]?.exists as string | null | undefined;

    if (!tableName) {
      throw new Error('Table public_reviews does not exist. Run migrations first: npm run migrate');
    }

    await pool.query('BEGIN');

    for (let i = 0; i < PUBLIC_REVIEWS_SEED.length; i++) {
      const review = PUBLIC_REVIEWS_SEED[i];
      const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(review.name)}`;

      await pool.query('DELETE FROM public_reviews WHERE author_name = $1 AND text = $2', [review.name, review.text]);

      await pool.query(
        `INSERT INTO public_reviews (author_name, author_avatar, author_location, rating, text, is_verified, category, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date)`,
        [review.name, avatar, review.location, review.rating, review.text, true, 'flight-booking', review.date],
      );
    }

    await pool.query('COMMIT');
    console.log(`✅ Seeded ${PUBLIC_REVIEWS_SEED.length} public reviews.`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Public reviews seed failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
