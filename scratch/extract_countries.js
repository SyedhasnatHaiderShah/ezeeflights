const fs = require('fs');
const path = require('path');

const nationalitiesPath = path.resolve(__dirname, '../apps/frontend/lib/nationalities.generated.ts');
const enJsonPath = path.resolve(__dirname, '../apps/frontend/translations/en.json');

const content = fs.readFileSync(nationalitiesPath, 'utf8');

// Use regex to parse name and nationality values
const nameRegex = /"name":\s*"([^"]+)"/g;
const nationalityRegex = /"nationality":\s*"([^"]+)"/g;

const keys = new Set();
let match;

while ((match = nameRegex.exec(content)) !== null) {
  keys.add(match[1]);
}
while ((match = nationalityRegex.exec(content)) !== null) {
  keys.add(match[1]);
}

const enData = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
let added = 0;

for (const key of keys) {
  if (enData[key] === undefined) {
    enData[key] = key;
    added++;
  }
}

if (added > 0) {
  fs.writeFileSync(enJsonPath, JSON.stringify(enData, null, 2), 'utf8');
  console.log(`Added ${added} countries/nationalities to en.json`);
} else {
  console.log("No new countries/nationalities to add.");
}
