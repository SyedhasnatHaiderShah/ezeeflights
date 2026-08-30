const fs = require('fs');
const path = require('path');

const files = [
  'apps/frontend/components/packages/TravelerForm.tsx',
  'apps/frontend/components/hotels/GuestForm.tsx',
  'apps/frontend/components/flights/BookingTravelersForm.tsx',
  'apps/frontend/components/shared/NationalitySelect.tsx',
  'apps/frontend/app/hotels/results/HotelResultsContent.tsx',
  'apps/frontend/components/hotels/HotelInlineSearchForm.tsx',
  'apps/frontend/app/hotels/[id]/page.tsx',
  'apps/frontend/app/hotels/booking/page.tsx',
  'apps/frontend/app/hotels/confirmation/page.tsx',
  'apps/frontend/app/hotels/search/page.tsx'
];

const enJsonPath = path.resolve(process.cwd(), 'apps/frontend/translations/en.json');
const enData = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));

const keys = new Set();

for (const file of files) {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf8');
  
  const doubleQuoteRegex = /t\(\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*\)/g;
  const singleQuoteRegex = /t\(\s*'([^'\\]*(?:\\.[^'\\]*)*)'\s*\)/g;
  
  let match;
  while ((match = doubleQuoteRegex.exec(content)) !== null) keys.add(match[1]);
  while ((match = singleQuoteRegex.exec(content)) !== null) keys.add(match[1]);
}
keys.add("Select country (optional)");

let added = 0;
for (const key of keys) {
  if (key.length <= 1) continue;
  if (enData[key] === undefined) {
    enData[key] = key;
    added++;
  }
}

if (added > 0) {
  fs.writeFileSync(enJsonPath, JSON.stringify(enData, null, 2), 'utf8');
  console.log(`Added ${added} new keys to en.json`);
} else {
  console.log("No new keys to add to en.json");
}
