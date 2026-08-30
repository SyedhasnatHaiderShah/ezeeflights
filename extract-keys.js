const fs = require('fs');
const path = require('path');

const dir = './apps/frontend/app/hotels';
const enFile = './apps/frontend/translations/en.json';

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = walk(dir);
const tRegex = /t\(\s*(["'])(.*?)\1\s*\)/g;
let foundKeys = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    foundKeys.push(match[2]);
  }
}

const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
let added = 0;

for (const key of foundKeys) {
  if (enData[key] === undefined) {
    enData[key] = key;
    added++;
  }
}

console.log(`Found ${foundKeys.length} total keys. Added ${added} new keys to en.json`);
fs.writeFileSync(enFile, JSON.stringify(enData, null, 2));
