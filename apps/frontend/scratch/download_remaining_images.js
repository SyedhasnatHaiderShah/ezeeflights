const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = path.join(__dirname, '../public/images/hero');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const IMAGES = {
  // Hero Section
  'flights_0.webp': 'https://images.unsplash.com/photo-1671837519100-dbd51ad53ab4?q=75&w=1200&auto=format&fit=crop',
  'flights_1.webp': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=75&w=1200&auto=format&fit=crop',
  'flights_2.webp': 'https://images.unsplash.com/photo-1774442960702-31cf7ff54c3b?q=75&w=1200&auto=format&fit=crop',
  'flights_3.webp': 'https://images.unsplash.com/photo-1743227401246-8b40586b98c9?q=75&w=1200&auto=format&fit=crop',
  'flights_4.webp': 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?q=75&w=1200&auto=format&fit=crop',
  'flights_5.webp': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=75&w=1200&auto=format&fit=crop',
  'flights_6.webp': 'https://images.unsplash.com/photo-1775229427158-f37349012078?q=75&w=1200&auto=format&fit=crop',
  'flights_7.webp': 'https://images.unsplash.com/photo-1542114740389-9b46fb1e5be7?q=75&w=1200&auto=format&fit=crop',
  
  'hotels_0.webp': 'https://images.unsplash.com/photo-1670915198844-51975abf6955?auto=format&fit=crop&w=1200&q=75',
  'hotels_1.webp': 'https://images.unsplash.com/photo-1745209978016-6af9d2272e8e?auto=format&fit=crop&w=1200&q=75',
  'hotels_2.webp': 'https://images.unsplash.com/photo-1721222201438-b59e2bbca679?auto=format&fit=crop&w=1200&q=75',
  'hotels_3.webp': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=75',
  'hotels_4.webp': 'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1200&q=75',
  'hotels_5.webp': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=75',
  
  'cars_0.webp': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=75',
  'cars_1.webp': 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=75',
  'cars_2.webp': 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=75',
  'cars_3.webp': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=75',
  'cars_4.webp': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=75',
  
  'packages_0.webp': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=75',
  'packages_1.webp': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=75',
  'packages_2.webp': 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=75',
  'packages_3.webp': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=75',
  'packages_4.webp': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=75',
  
  'transfers_0.webp': 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=75',
  'transfers_1.webp': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=75',
  'transfers_2.webp': 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=75',
  'transfers_3.webp': 'https://images.unsplash.com/photo-1597007030739-6d2e8d2b8f79?auto=format&fit=crop&w=1200&q=75',
  'transfers_4.webp': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=75',

  // Fallback Section Elements
  'destination_fallback.webp': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=75&w=1200'
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    // Force WebP format for high compression
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
  const filenames = Object.keys(IMAGES);
  for (const filename of filenames) {
    const dest = path.join(OUTPUT_DIR, filename);
    const url = IMAGES[filename];

    // Check if file exists and has size
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      console.log(`Skipping ${filename} (already exists)`);
      continue;
    }

    console.log(`Downloading ${filename}...`);
    try {
      await download(url, dest);
      console.log(`Downloaded ${filename} successfully.`);
    } catch (err) {
      console.error(`Error downloading ${filename}:`, err.message);
    }
  }

  console.log('All downloads complete!');
}

run();
