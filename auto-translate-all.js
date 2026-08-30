const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.join(__dirname, 'apps', 'frontend', 'translations');

// List of trash/code parameter keys to exclude
const garbageKeys = new Set([
  '/?tab=hotels', 'tab', 'dealId', 'dDate', 'script', 'T', 'org', 'des', 'id', 'tranId',
  'flightId', 'adt', 'chd', 'chld', 'inf', 'bidId', 'prefClass', 'class', 'rDate', 'trip',
  'searchId', 'verified', 'utm_source', 'pickup_date', 'dropoff_date', 'returnDate', 'page',
  'limit', 'hotelId', 'partnerCode', 'promo', 'payment_id', 'payment_intent', 'callbackUrl',
  'vendor', 'rateToken', 'hero-ready', 'ezee-highlight-search', './lib/sentry/sentry-server-config',
  'capacitor-native-biometric', 'name', 'type', 'subject', 'body', 'variables', 'optional',
  'DirectFlightsOnly", form.DirectFlightsOnly ? "true" : "false',
  'dDate", firstLeg.departureDate.split("T',
  'trip", flight.inbound?.length > 0 ? "round-trip" : "one-way',
  'rDate", flight.inbound[0].departureDate.split("T',
  'org\', (origin || \'LHE', 'des\', (destination || \'DXB',
  'id", flightIds.join(",'
]);

const langCodes = {
  'ar': { gCode: 'ar', nestedDir: 'ar' },
  'de': { gCode: 'de', nestedDir: 'de' },
  'es': { gCode: 'es', nestedDir: 'es' },
  'et': { gCode: 'et', nestedDir: 'et' },
  'fr': { gCode: 'fr', nestedDir: 'fr' },
  'hi': { gCode: 'hi', nestedDir: 'hi' },
  'jpn': { gCode: 'ja', nestedDir: 'jpn' },
  'ko': { gCode: 'ko', nestedDir: 'ko' },
  'th': { gCode: 'th', nestedDir: 'th' },
  'tl': { gCode: 'tl', nestedDir: 'tl' },
  'tr': { gCode: 'tr', nestedDir: 'tr' },
  'ur': { gCode: 'ur', nestedDir: 'ur' },
  'zh-hans': { gCode: 'zh-CN', nestedDir: 'zh-Hans' },
  'zh-hant': { gCode: 'zh-TW', nestedDir: 'zh-Hant' }
};

function translateText(text, targetLang) {
  return new Promise((resolve) => {
    if (!text || !/[a-zA-Z]/.test(text)) {
      return resolve(text);
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed[0] && parsed[0][0] && parsed[0][0][0]) {
            let translated = parsed[0].map(x => x[0]).join('');
            translated = translated.replace(/\{\{\s*(\w+)\s*\}\}/g, '{{$1}}');
            resolve(translated);
          } else {
            resolve(text);
          }
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => {
      resolve(text);
    });
  });
}

async function run() {
  const enData = JSON.parse(fs.readFileSync(path.join(rootDir, 'en.json'), 'utf8'));
  const enKeys = Object.keys(enData).filter(k => !garbageKeys.has(k));

  for (const [langKey, info] of Object.entries(langCodes)) {
    const file = path.join(rootDir, `${langKey}.json`);

    console.log(`Processing ${langKey}...`);
    let data = {};
    if (fs.existsSync(file)) {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    }

    // Find all untranslated keys
    const untranslatedKeys = enKeys.filter(k => {
      const val = data[k];
      return (val === undefined || val === k || val === enData[k]) && /[a-zA-Z]/.test(k);
    });

    console.log(`Found ${untranslatedKeys.length} untranslated keys for ${langKey}`);

    let count = 0;
    for (const key of untranslatedKeys) {
      const translated = await translateText(key, info.gCode);
      data[key] = translated;
      count++;
      if (count % 20 === 0) {
        console.log(`Translated ${count}/${untranslatedKeys.length} for ${langKey}`);
      }
      await new Promise(r => setTimeout(r, 60));
    }

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Finished ${langKey}.json`);
  }
  console.log("All translations completed!");
}

run();
