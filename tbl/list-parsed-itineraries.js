const fs = require('fs');

function loadParsed(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8')).map((x) => {
    const segs = x.segments || [];
    const leg = (g) =>
      segs
        .filter((s) => String(s.Group) === g)
        .map(
          (s) =>
            `${s.Carrier}${s.FlightNumber} ${s.Origin}-${s.Destination} ${(s.DepartureTime || '').slice(0, 16)}`,
        );
    const out = leg('0');
    const ret = leg('1');
    return {
      key: x.id,
      plating: x.airlineCode,
      price: x.price,
      currency: x.currency,
      stops: x.stops,
      outFlights: out.map((s) => s.split(' ')[0]).join('+'),
      retFlights: ret.map((s) => s.split(' ')[0]).join('+'),
      outDetail: out.join(' | '),
      retDetail: ret.join(' | '),
      outDep: (segs.find((s) => String(s.Group) === '0') || {}).DepartureTime || '',
      retDep: (segs.find((s) => String(s.Group) === '1') || {}).DepartureTime || '',
    };
  });
}

function itineraryKey(x) {
  return `${x.plating}|${x.outFlights}|${x.retFlights}`;
}

function groupItins(list) {
  const m = new Map();
  for (const x of list) {
    const k = itineraryKey(x);
    if (!m.has(k)) {
      m.set(k, {
        plating: x.plating,
        outFlights: x.outFlights,
        retFlights: x.retFlights,
        outDetail: x.outDetail,
        retDetail: x.retDetail,
        outDep: x.outDep.slice(0, 16),
        retDep: x.retDep.slice(0, 16),
        minPrice: x.price,
        maxPrice: x.price,
        prices: new Set([x.price]),
        variants: 0,
      });
    }
    const g = m.get(k);
    g.variants++;
    g.prices.add(x.price);
    g.minPrice = Math.min(g.minPrice, x.price);
    g.maxPrice = Math.max(g.maxPrice, x.price);
  }
  return m;
}

const parsed = loadParsed(
  'C:/ezeeflights-aws/apps/backend/logs/travelport_responses/parsed-results.json',
);
const itins = groupItins(parsed);
const rows = [...itins.values()].sort(
  (a, b) => a.plating.localeCompare(b.plating) || a.outDep.localeCompare(b.outDep),
);

console.log('Total solutions (parsed = server):', parsed.length);
console.log('Unique physical itineraries:', rows.length);
console.log('');

const byAir = {};
for (const r of rows) {
  byAir[r.plating] = (byAir[r.plating] || 0) + 1;
}
console.log('Unique itineraries by airline:', byAir);
console.log('\n=== ALL UNIQUE FLIGHT COMBINATIONS ===\n');

rows.forEach((r, i) => {
  console.log(
    `${String(i + 1).padStart(3)}. [${r.plating}] ${r.variants} fare variant(s) | INR ${r.minPrice}${r.minPrice !== r.maxPrice ? '-' + r.maxPrice : ''}`,
  );
  console.log(`     OUT (${r.outDep}): ${r.outDetail}`);
  console.log(`     RET (${r.retDep}): ${r.retDetail}`);
  console.log('');
});

fs.writeFileSync(
  'C:/ezeeflights-aws/tbl/all-unique-itineraries.json',
  JSON.stringify(
    rows.map((r) => ({
      ...r,
      prices: [...r.prices].sort((a, b) => a - b),
    })),
    null,
    2,
  ),
);
