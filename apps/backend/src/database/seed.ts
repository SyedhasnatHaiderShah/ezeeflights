import * as mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const countries = [
  {
    name: "United Arab Emirates",
    code: "ARE",
    region: "MIDDLE EAST",
    hero_image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1200",
  },
  {
    name: "United Kingdom",
    code: "GBR",
    region: "EUROPE",
    hero_image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1200",
  },
  {
    name: "United States",
    code: "USA",
    region: "AMERICAS",
    hero_image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200",
  },
  {
    name: "India",
    code: "IND",
    region: "ASIA",
    hero_image:
      "https://images.unsplash.com/photo-1524492707947-2f85a1b9039a?auto=format&fit=crop&q=80&w=1200",
  },
  {
    name: "France",
    code: "FRA",
    region: "EUROPE",
    hero_image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1200",
  },
  {
    name: "Japan",
    code: "JPN",
    region: "ASIA",
    hero_image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200",
  },
  {
    name: "Spain",
    code: "ESP",
    region: "EUROPE",
    hero_image:
      "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&q=80&w=1200",
  },
];

const cities = [
  {
    name: "Dubai",
    slug: "dubai",
    country_code: "ARE",
    description: "The city of gold and futuristic skyscrapers.",
    lat: 25.2048,
    lng: 55.2708,
    is_featured: true,
    from_price: 299,
    hero_image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "London",
    slug: "london",
    country_code: "GBR",
    description: "History meets modern culture in the heart of the UK.",
    lat: 51.5074,
    lng: -0.1278,
    is_featured: true,
    from_price: 349,
    hero_image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "New York",
    slug: "new-york",
    country_code: "USA",
    description: "The city that never sleeps.",
    lat: 40.7128,
    lng: -74.006,
    is_featured: true,
    from_price: 499,
    hero_image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Delhi",
    slug: "delhi",
    country_code: "IND",
    description: "The heart of India, where history and modernity coexist.",
    lat: 28.6139,
    lng: 77.209,
    is_featured: true,
    from_price: 199,
    hero_image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Paris",
    slug: "paris",
    country_code: "FRA",
    description: "The city of love and lights.",
    lat: 48.8566,
    lng: 2.3522,
    is_featured: true,
    from_price: 249,
    hero_image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Tokyo",
    slug: "tokyo",
    country_code: "JPN",
    description: "Where tradition meets the future.",
    lat: 35.6762,
    lng: 139.6503,
    is_featured: true,
    from_price: 599,
    hero_image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Madrid",
    slug: "madrid",
    country_code: "ESP",
    description: "Vibrant capital of Spain, rich in art and culinary scenes.",
    lat: 40.4168,
    lng: -3.7038,
    is_featured: true,
    from_price: 279,
    hero_image:
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=800",
  },
];

const packages = [
  {
    title: "Delhi Cultural Escape",
    type: "package",
    origin_city: "London",
    destination: "Delhi",
    airline: "British Airways",
    country: "India",
    duration_days: 5,
    base_price: 499,
    is_flash_sale: true,
    expires_at: new Date(Date.now() + 86400000 * 2)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
    thumbnail_url:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=800",
    description:
      "Experience the vibrant heart of India with our curated Delhi tour. From historic monuments to bustling markets.",
  },
  {
    title: "Dubai Luxury Getaway",
    type: "package",
    origin_city: "Manchester",
    destination: "Dubai",
    airline: "Emirates",
    country: "UAE",
    duration_days: 4,
    base_price: 899,
    is_flash_sale: false,
    expires_at: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
    description:
      "Stay in 5-star luxury and enjoy desert safaris and world-class shopping in the city of gold.",
  },
  {
    title: "London - Paris Direct",
    type: "flight_deal",
    origin_city: "London",
    destination: "Paris",
    airline: "Eurostar",
    country: "France",
    duration_days: 1,
    base_price: 99,
    is_flash_sale: true,
    expires_at: new Date(Date.now() + 86400000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
    thumbnail_url:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800",
    description:
      "Quick flight deal to the city of lights. Perfect for a business trip or short stay.",
  },
  {
    title: "New York City Lights",
    type: "package",
    origin_city: "Paris",
    destination: "New York",
    airline: "Air France",
    country: "USA",
    duration_days: 6,
    base_price: 1599,
    is_flash_sale: true,
    expires_at: new Date(Date.now() + 86400000 * 3)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
    thumbnail_url:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800",
    description:
      "Experience the energy of Times Square and the tranquility of Central Park in this ultimate NYC tour.",
  },
  {
    title: "Delhi - Singapore Flight",
    type: "flight_deal",
    origin_city: "Delhi",
    destination: "Singapore",
    airline: "Singapore Airlines",
    country: "Singapore",
    duration_days: 1,
    base_price: 350,
    is_flash_sale: false,
    expires_at: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?auto=format&fit=crop&q=80&w=800",
    description:
      "Direct flight from Delhi to Singapore. Best price guaranteed.",
  },
  {
    title: "Tokyo Tech & Tradition",
    type: "package",
    origin_city: "San Francisco",
    destination: "Tokyo",
    airline: "Japan Airlines",
    country: "Japan",
    duration_days: 7,
    base_price: 1850,
    is_flash_sale: false,
    expires_at: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800",
    description:
      "Discover the perfect blend of neon skyscrapers and ancient temples in the heart of Japan.",
  },
  {
    title: "Mumbai - Dubai Special",
    type: "flight_deal",
    origin_city: "Mumbai",
    destination: "Dubai",
    airline: "Air India",
    country: "UAE",
    duration_days: 1,
    base_price: 280,
    is_flash_sale: true,
    expires_at: new Date(Date.now() + 3600000 * 12)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
    thumbnail_url:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
    description:
      "Flash deal on Mumbai to Dubai flights. Grab it before it's gone!",
  },
  {
    title: "New York - London Special",
    type: "flight_deal",
    origin_city: "New York",
    destination: "London",
    airline: "Virgin Atlantic",
    country: "United Kingdom",
    duration_days: 1,
    base_price: 399,
    is_flash_sale: true,
    expires_at: new Date(Date.now() + 86400000 * 1.5)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
    thumbnail_url:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800",
    description:
      "Special direct flight deal from New York to London. Book now to save!",
  },
];

const users = [
  {
    id: "10b4fe47-9ed6-4bd3-8689-e63251c56b85",
    email: "admin@example.com",
    password_hash:
      "$2b$12$ZEoIShCpXucqEI7YYCpkMuH6rwJhAx7Y.5Bxzdu9URU2d8s8/Nv7m",
    first_name: "Muhammad",
    last_name: "Shahzad",
    oauth_provider: null,
    preferred_currency: "USD",
    phone: "03006676031",
    role: "USER",
    nationality: "Pakistani",
    passport_number: "pk3006676031",
    passport_expiry: null,
    created_at: "2026-04-22 19:33:58",
    updated_at: "2026-05-03 09:54:35",
    date_of_birth: null,
    gender: null,
  },

  {
    id: "2a87a691-c7d6-4f9a-8311-d5c6cebb4dfa",
    email: "user2@ezeeflights.com",
    password_hash:
      "$2b$12$cVV6LA6N37OGWWS82QIBn./mJSsLLM6nrrt7JCTONcj9ZOoIcMH5a",
    first_name: "Bob",
    last_name: "Smith",
    oauth_provider: null,
    preferred_currency: "USD",
    phone: null,
    role: "USER",
    nationality: null,
    passport_number: null,
    passport_expiry: null,
    created_at: "2026-04-22 19:34:58",
    updated_at: "2026-04-22 19:34:58",
    date_of_birth: null,
    gender: null,
  },

  {
    id: "75ac0018-7b5b-4f58-a910-b4a8fd7a78e9",
    email: "user1@ezeeflights.com",
    password_hash:
      "$2b$12$thMCesrau6ulUQMElE99Y.3xwSlCfjQTfJ0X8oD8UjFxY9xkDfPkm",
    first_name: "Alice",
    last_name: "Johnson k",
    oauth_provider: null,
    preferred_currency: "USD",
    phone: null,
    role: "USER",
    nationality: null,
    passport_number: null,
    passport_expiry: null,
    created_at: "2026-04-22 19:34:58",
    updated_at: "2026-05-04 18:26:00",
    date_of_birth: null,
    gender: null,
  },
];

async function seed() {
  console.log("🌱 Starting MySQL database seed...");

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_SERVER || "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: process.env.MYSQL_UID || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "worldrix_ezeecrm",
  });

  try {
    console.log(
      "✅ Seed script safety enabled: skipping CREATE and TRUNCATE commands on live database tables.",
    );

    // 2. Seed tbl_topdestinations
    console.log("🌍 Seeding tbl_topdestinations...");
    try {
      for (const city of cities) {
        const country = countries.find((c) => c.code === city.country_code);
        const region = country ? country.region : "OTHER";
        const countryName = country ? country.name : "";

        await connection.execute(
          `INSERT INTO tbl_topdestinations (name, slug, country, code, region, hero_image, description, from_price, is_featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            city.name,
            city.slug,
            countryName,
            city.country_code,
            region,
            city.hero_image,
            city.description,
            city.from_price,
            city.is_featured ? 1 : 0,
          ],
        );
      }
      console.log("✅ tbl_topdestinations seeded");
    } catch (err: any) {
      if (err.code === "ER_NO_SUCH_TABLE")
        console.warn("⚠️ tbl_topdestinations doesn't exist, skipping.");
      else throw err;
    }

    // 3. Seed tbl_flightdeals and tbl_popularpackage
    console.log("✈️ Seeding packages and flight deals...");
    try {
      for (const pkg of packages) {
        const slug = pkg.title.toLowerCase().replace(/\s+/g, "-");
        const targetTable =
          pkg.type === "flight_deal" ? "tbl_flightdeals" : "tbl_popularpackage";

        await connection.execute(
          `INSERT INTO ${targetTable} (title, slug, description, origin_city, destination, airline_name, country, duration_days, base_price, thumbnail_url, is_flash_sale, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pkg.title,
            slug,
            pkg.description,
            pkg.origin_city,
            pkg.destination,
            pkg.airline,
            pkg.country,
            pkg.duration_days,
            pkg.base_price,
            pkg.thumbnail_url,
            pkg.is_flash_sale ? 1 : 0,
            pkg.expires_at,
          ],
        );
      }
      console.log("✅ Packages and Flight Deals seeded");
    } catch (err: any) {
      if (err.code === "ER_NO_SUCH_TABLE")
        console.warn("⚠️ Packages/Flight Deals tables don't exist, skipping.");
      else throw err;
    }

    // 4. Seed custom users
    console.log("👥 Seeding custom users...");
    try {
      const allowedKeys = [
        "id",
        "email",
        "password_hash",
        "first_name",
        "last_name",
        "oauth_provider",
        "preferred_currency",
        "phone",
        "role",
        "nationality",
        "passport_number",
        "passport_expiry",
        "created_at",
        "updated_at",
        "date_of_birth",
        "gender",
      ];

      for (const user of users) {
        const filteredKeys = Object.keys(user).filter((k) =>
          allowedKeys.includes(k),
        );
        const filteredValues = filteredKeys.map((k) => (user as any)[k]);

        const placeholders = filteredKeys.map(() => "?").join(", ");
        const updateClause = filteredKeys
          .filter((k) => k !== "id" && k !== "email")
          .map((k) => `\`${k}\` = VALUES(\`${k}\`)`)
          .join(", ");

        const sqlQuery = `
          INSERT INTO tbl_users (${filteredKeys.map((k) => `\`${k}\``).join(", ")})
          VALUES (${placeholders})
          ON DUPLICATE KEY UPDATE ${updateClause || "`email` = VALUES(`email`)"}
        `;

        await connection.execute(sqlQuery, filteredValues);
        console.log(`  Seeded user: ${user.email}`);
      }
      console.log("✅ Users seeded");
    } catch (err: any) {
      if (err.code === "ER_NO_SUCH_TABLE")
        console.warn("⚠️ tbl_users doesn't exist, skipping.");
      else throw err;
    }

    console.log("✨ Seeding completed successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await connection.end();
  }
}

seed();
