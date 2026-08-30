const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Simple env parser
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key.trim()] = value;
    }
  }
}

loadEnv(path.resolve(__dirname, '../../.env'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const countries = [
  { name: 'United Arab Emirates', code: 'AE', region: 'MIDDLE EAST', hero_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1200' },
  { name: 'United Kingdom', code: 'GB', region: 'EUROPE', hero_image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1200' },
  { name: 'United States', code: 'US', region: 'AMERICAS', hero_image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200' },
  { name: 'India', code: 'IN', region: 'ASIA', hero_image: 'https://images.unsplash.com/photo-1524492707947-2f85a1b9039a?auto=format&fit=crop&q=80&w=1200' },
  { name: 'France', code: 'FR', region: 'EUROPE', hero_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1200' },
];

const cities = [
  { name: 'Dubai', slug: 'dubai', country_code: 'AE', description: 'The city of gold and futuristic skyscrapers.', lat: 25.2048, lng: 55.2708, is_featured: true, hero_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800' },
  { name: 'London', slug: 'london', country_code: 'GB', description: 'History meets modern culture in the heart of the UK.', lat: 51.5074, lng: -0.1278, is_featured: true, hero_image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800' },
  { name: 'New York', slug: 'new-york', country_code: 'US', description: 'The city that never sleeps.', lat: 40.7128, lng: -74.0060, is_featured: true, hero_image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800' },
  { name: 'Delhi', slug: 'delhi', country_code: 'IN', description: 'The heart of India, where history and modernity coexist.', lat: 28.6139, lng: 77.2090, is_featured: true, hero_image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=800' },
  { name: 'Paris', slug: 'paris', country_code: 'FR', description: 'The city of love and lights.', lat: 48.8566, lng: 2.3522, is_featured: true, hero_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800' },
];

const attractions = [
  { city_slug: 'dubai', name: 'Burj Khalifa', slug: 'burj-khalifa', category: 'nightlife', description: 'The tallest building in the world.', lat: 25.1972, lng: 55.2744, rating: 4.9, reviews: 12000, images: ['https://images.unsplash.com/photo-1526495124232-a02e18494d40?auto=format&fit=crop&q=80&w=800'] },
  { city_slug: 'london', name: 'Big Ben', slug: 'big-ben', category: 'museum', description: 'The iconic clock tower.', lat: 51.5007, lng: -0.1246, rating: 4.7, reviews: 8500, images: ['https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&q=80&w=800'] },
  { city_slug: 'new-york', name: 'Statue of Liberty', slug: 'statue-of-liberty', category: 'museum', description: 'Symbol of freedom.', lat: 40.6892, lng: -74.0445, rating: 4.8, reviews: 15000, images: ['https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=800'] },
];

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Seed Countries
    for (const c of countries) {
      await pool.query(
        `INSERT INTO countries (name, code, description, region, hero_image)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (code) DO UPDATE SET region = $4, hero_image = $5`,
        [c.name, c.code, `Explore ${c.name}`, c.region, c.hero_image]
      );
    }
    console.log('✅ Countries seeded');

    // 2. Seed Cities
    for (const city of cities) {
      const countryResult = await pool.query('SELECT id FROM countries WHERE code = $1', [city.country_code]);
      const countryId = countryResult.rows[0].id;

      await pool.query(
        `INSERT INTO cities (country_id, name, slug, description, latitude, longitude, is_featured, hero_image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (slug) DO UPDATE SET is_featured = $7, hero_image = $8`,
        [countryId, city.name, city.slug, city.description, city.lat, city.lng, city.is_featured, city.hero_image]
      );
    }
    console.log('✅ Cities seeded');

    // 3. Seed Attractions
    for (const a of attractions) {
      const cityResult = await pool.query('SELECT id FROM cities WHERE slug = $1', [a.city_slug]);
      const cityId = cityResult.rows[0].id;

      const attrResult = await pool.query(
        `INSERT INTO attractions (city_id, name, slug, description, category, latitude, longitude, rating, total_reviews)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (city_id, slug) DO UPDATE SET rating = $8, total_reviews = $9
         RETURNING id`,
        [cityId, a.name, a.slug, a.description, a.category, a.lat, a.lng, a.rating, a.reviews]
      );
      const attractionId = attrResult.rows[0].id;

      for (const img of a.images) {
        await pool.query(
          `INSERT INTO attraction_images (attraction_id, image_url) VALUES ($1, $2)`,
          [attractionId, img]
        );
      }
    }
    console.log('✅ Attractions seeded');

    console.log('✨ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await pool.end();
  }
}

seed();
