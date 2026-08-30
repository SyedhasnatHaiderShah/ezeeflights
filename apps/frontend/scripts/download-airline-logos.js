const fs = require('fs');
const path = require('path');

// Paths
const dataFilePath = path.join(__dirname, '../lib/data/airlines-complete-name.json');
const outputDir = path.join(__dirname, '../public/images/airlines');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load airline codes
let airlines = [];
try {
  const fileContent = fs.readFileSync(dataFilePath, 'utf8');
  airlines = JSON.parse(fileContent);
} catch (err) {
  console.error('Failed to read catalog file:', err);
  process.exit(1);
}

// Get list of unique IATA codes
const codes = [...new Set(
  airlines
    .map(a => (a.iata || '').trim().toUpperCase())
    .filter(code => code && code.length === 2)
)];

console.log(`Found ${codes.length} unique airline IATA codes.`);

// Download queue
const CONCURRENCY = 15;
let index = 0;
let downloaded = 0;
let skipped = 0;
let failed = 0;

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Status code ${res.status}`);
  }
  const text = await res.text();
  // Ensure we actually got a valid SVG element, not HTML error pages
  if (!text.includes('<svg')) {
    throw new Error('Response is not a valid SVG');
  }
  fs.writeFileSync(dest, text);
}

async function worker() {
  while (index < codes.length) {
    const code = codes[index++];
    const destPath = path.join(outputDir, `${code}.svg`);

    // Skip if already exists and is non-empty
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      skipped++;
      continue;
    }

    // Duffel Symbol-Only vector SVG CDN format
    const url = `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${code}.svg`;
    try {
      await downloadFile(url, destPath);
      downloaded++;
      console.log(`[${downloaded + skipped + failed}/${codes.length}] Downloaded symbol-only ${code}.svg`);
    } catch (err) {
      failed++;
      // It's normal for obscure airlines to fail on Duffel, they will fall back to PNG/Initials
      console.warn(`Could not get symbol SVG for ${code}: ${err.message}`);
    }
    // Add small delay to be polite
    await new Promise(r => setTimeout(r, 50));
  }
}

async function main() {
  console.log(`Starting SVG symbol download using up to ${CONCURRENCY} parallel workers...`);
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  console.log('\nSymbol Download Summary:');
  console.log(`- SVG Symbols Downloaded: ${downloaded}`);
  console.log(`- Skipped (already exist): ${skipped}`);
  console.log(`- Not in Duffel CDN (will fallback): ${failed}`);
  console.log(`- Total: ${codes.length}`);
}

main().catch(err => {
  console.error('Migration script failed:', err);
});
