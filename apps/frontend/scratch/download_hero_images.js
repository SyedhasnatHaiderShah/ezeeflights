const fs = require('fs');
const path = require('path');
const https = require('https');

const HERO_FILE = path.join(__dirname, '../components/sections/Hero.tsx');
const OUTPUT_DIR = path.join(__dirname, '../public/images/hero');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const content = fs.readFileSync(HERO_FILE, 'utf8');

// Regular expression to find Unsplash URLs
const urlRegex = /"https:\/\/images\.unsplash\.com\/photo-[^"]+"/g;
const matches = content.match(urlRegex) || [];

console.log(`Found ${matches.length} Unsplash URLs in Hero.tsx.`);

// Map category names by matching blocks
const categories = ['flights', 'hotels', 'cars', 'packages', 'transfers'];
let currentCatIdx = 0;
let fileIdx = 0;

// Simple download helper
function download(url, dest) {
  return new Promise((resolve, reject) => {
    // Append WebP format parameter to Unsplash URL for high compression
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set('fm', 'webp');
    parsedUrl.searchParams.set('w', '1200');
    parsedUrl.searchParams.set('q', '75');

    const file = fs.createWriteStream(dest);
    https.get(parsedUrl.toString(), (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: Status code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  // Let's parse categories from Hero.tsx or just assign them as we go
  // Based on categories list: flights: 8 images, hotels: 6 images, cars: 5 images, packages: 5 images, transfers: 5 images
  const counts = { flights: 8, hotels: 6, cars: 5, packages: 5, transfers: 5 };
  const keys = Object.keys(counts);
  let globalUrlIdx = 0;

  for (const category of keys) {
    const limit = counts[category];
    for (let i = 0; i < limit; i++) {
      if (globalUrlIdx >= matches.length) break;
      const cleanUrl = matches[globalUrlIdx].replace(/"/g, '');
      const filename = `${category}_${i}.webp`;
      const dest = path.join(OUTPUT_DIR, filename);

      console.log(`Downloading [${category} ${i}] to ${filename}...`);
      try {
        await download(cleanUrl, dest);
        console.log(`Downloaded ${filename} successfully.`);
      } catch (err) {
        console.error(`Error downloading ${cleanUrl}:`, err.message);
      }
      globalUrlIdx++;
    }
  }

  console.log('All downloads complete!');
}

run();
