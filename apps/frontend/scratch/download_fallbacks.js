const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = path.join(__dirname, '../public/images/hero');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
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
  const url = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=1200';
  const dest = path.join(OUTPUT_DIR, 'destination_fallback.webp');
  
  console.log('Downloading fallback image...');
  try {
    await download(url, dest);
    console.log('Downloaded destination_fallback.webp successfully.');
  } catch (err) {
    console.error('Error downloading fallback image:', err.message);
  }
}

run();
