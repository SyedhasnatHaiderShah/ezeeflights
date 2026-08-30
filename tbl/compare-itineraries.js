const fs = require('fs');

function extractSolutions(xml) {
  const solutions = [];
  const re = /<air:AirPricingSolution[^>]*Key="([^"]+)"[^>]*>/g;
  let m;
  while ((m = re.exec(xml))) {
    const key = m[1];
    const start = m.index;
    const endTag = '</air:AirPricingSolution>';
    const end = xml.indexOf(endTag, start);
    const block =
      end > start ? xml.slice(start, end + endTag.length) : xml.slice(start, 12000);

    const plating = (block.match(/PlatingCarrier="([^"]+)"/) || [])[1] || '';
    const total = (block.match(/TotalPrice="([^"]+)"/) || [])[1] || '';

    // BookingInfo refs tie segments to leg group
    const bookingInfos = [...block.matchAll(
      /<air:BookingInfo[^>]*SegmentRef="([^"]+)"[^>]*FareInfoRef="([^"]+)"[^>]*\/>/g,
    )];
    const segRefs = bookingInfos.map((b) => b[1]);

    // AirSegment blocks in parent response - pull from full xml using refs
    const segs = [];
    for (const ref of segRefs) {
      const segRe = new RegExp(
        `<air:AirSegment[^>]*Key="${ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*Group="(\\d)"[^>]*Carrier="([^"]+)"[^>]*FlightNumber="([^"]+)"[^>]*Origin="([^"]+)"[^>]*Destination="([^"]+)"[^>]*DepartureTime="([^"]+)"`,
      );
      const sm = xml.match(segRe);
      if (sm) {
        segs.push({
          group: sm[1],
          carrier: sm[2],
          fn: sm[3],
          origin: sm[4],
          dest: sm[5],
          dep: sm[6],
        });
      }
    }

    // Fallback: inline segments in block
    if (!segs.length) {
      const segRe2 =
        /Group="(\d)"[^>]*Carrier="([^"]+)"[^>]*FlightNumber="([^"]+)"[^>]*Origin="([^"]+)"[^>]*Destination="([^"]+)"[^>]*DepartureTime="([^"]+)"/g;
      let sm;
      while ((sm = segRe2.exec(block))) {
        segs.push({
          group: sm[1],
          carrier: sm[2],
          fn: sm[3],
          origin: sm[4],
          dest: sm[5],
          dep: sm[6],
        });
      }
    }

    const leg = (g) =>
      segs
        .filter((s) => s.group === g)
        .map((s) => `${s.carrier}${s.fn}`)
        .join('+');

    solutions.push({
      key,
      plating,
      total,
      outFlights: leg('0'),
      retFlights: leg('1'),
      outRoute: segs
        .filter((s) => s.group === '0')
        .map((s) => `${s.origin}-${s.dest}`)
        .join('>'),
      retRoute: segs
        .filter((s) => s.group === '1')
        .map((s) => `${s.origin}-${s.dest}`)
        .join('>'),
      outDep: (segs.find((s) => s.group === '0') || {}).dep || '',
      retDep: (segs.find((s) => s.group === '1') || {}).dep || '',
    });
  }
  return solutions;
}

function loadParsed(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8')).map((x) => {
    const segs = x.segments || [];
    const leg = (g) =>
      segs
        .filter((s) => String(s.Group) === g)
        .map((s) => `${s.Carrier}${s.FlightNumber}`)
        .join('+');
    return {
      key: x.id,
      plating: x.airlineCode,
      total: `${x.currency}${x.price}`,
      outFlights: leg('0'),
      retFlights: leg('1'),
      outRoute: segs
        .filter((s) => String(s.Group) === '0')
        .map((s) => `${s.Origin}-${s.Destination}`)
        .join('>'),
      retRoute: segs
        .filter((s) => String(s.Group) === '1')
        .map((s) => `${s.Origin}-${s.Destination}`)
        .join('>'),
      outDep: (segs.find((s) => String(s.Group) === '0') || {}).DepartureTime || '',
      retDep: (segs.find((s) => String(s.Group) === '1') || {}).DepartureTime || '',
    };
  });
}

function itineraryKey(x) {
  return `${x.plating}|${x.outFlights}|${x.retFlights}|${x.outRoute}|${x.retRoute}`;
}

function groupByItinerary(list) {
  const map = new Map();
  for (const x of list) {
    const k = itineraryKey(x);
    if (!map.has(k)) {
      map.set(k, {
        plating: x.plating,
        outFlights: x.outFlights,
        retFlights: x.retFlights,
        outRoute: x.outRoute,
        retRoute: x.retRoute,
        outDep: x.outDep.slice(0, 16),
        retDep: x.retDep.slice(0, 16),
        prices: new Set(),
        count: 0,
      });
    }
    const g = map.get(k);
    g.prices.add(x.total);
    g.count++;
  }
  return map;
}

const postman = fs.readFileSync('C:/ezeeflights-aws/tbl/postman-response.xml', 'utf8');
const server = fs.readFileSync(
  'C:/ezeeflights-aws/apps/backend/logs/travelport_responses/server-response.xml',
  'utf8',
);
const parsed = loadParsed(
  'C:/ezeeflights-aws/apps/backend/logs/travelport_responses/parsed-results.json',
);

const pm = extractSolutions(postman);
const sv = extractSolutions(server);

const pmItins = groupByItinerary(pm);
const svItins = groupByItinerary(sv);
const parsedItins = groupByItinerary(parsed);

const pmKeys = new Set(pmItins.keys());
const svKeys = new Set(svItins.keys());
const parsedKeys = new Set(parsedItins.keys());

console.log('Solutions: Postman', pm.length, 'Server', sv.length, 'Parsed', parsed.length);
console.log('Unique itineraries: Postman', pmItins.size, 'Server', svItins.size, 'Parsed', parsedItins.size);
console.log('Itins only Postman:', [...pmKeys].filter((k) => !svKeys.has(k)).length);
console.log('Itins only Server:', [...svKeys].filter((k) => !pmKeys.has(k)).length);
console.log('Itins in Server not Parsed:', [...svKeys].filter((k) => !parsedKeys.has(k)).length);

const rows = [];
for (const k of [...pmKeys].sort()) {
  const p = pmItins.get(k);
  const s = svItins.get(k);
  const j = parsedItins.get(k);
  rows.push({
    airline: p.plating,
    outbound: `${p.outFlights} (${p.outRoute})`,
    return: `${p.retFlights} (${p.retRoute})`,
    depart: p.outDep,
    returnDate: p.retDep,
    postmanVariants: p.count,
    serverVariants: s ? s.count : 0,
    parsedVariants: j ? j.count : 0,
    postmanPrices: [...p.prices].sort(),
    serverPrices: s ? [...s.prices].sort() : [],
    inPostman: true,
    inServer: !!s,
    inParsed: !!j,
  });
}

// Itineraries only on one side
for (const k of [...svKeys].filter((k) => !pmKeys.has(k))) {
  const s = svItins.get(k);
  rows.push({
    airline: s.plating,
    outbound: `${s.outFlights} (${s.outRoute})`,
    return: `${s.retFlights} (${s.retRoute})`,
    depart: s.outDep,
    returnDate: s.retDep,
    postmanVariants: 0,
    serverVariants: s.count,
    parsedVariants: parsedItins.get(k)?.count || 0,
    postmanPrices: [],
    serverPrices: [...s.prices].sort(),
    inPostman: false,
    inServer: true,
    inParsed: parsedItins.has(k),
  });
}

rows.sort((a, b) => a.airline.localeCompare(b.airline) || a.depart.localeCompare(b.depart));

console.log('\n=== ALL UNIQUE ITINERARIES (side by side) ===\n');
rows.forEach((r, i) => {
  const status =
    r.inPostman && r.inServer && r.inParsed
      ? 'ALL 3 MATCH'
      : `Postman=${r.inPostman} Server=${r.inServer} Parsed=${r.inParsed}`;
  console.log(
    `${String(i + 1).padStart(2)}. [${r.airline}] OUT ${r.outbound} | RET ${r.return}`,
  );
  console.log(
    `    Depart ${r.depart} / Return ${r.returnDate}`,
  );
  console.log(
    `    Fare variants: Postman=${r.postmanVariants} Server=${r.serverVariants} Parsed=${r.parsedVariants} | ${status}`,
  );
  if (r.postmanPrices.length && r.serverPrices.length) {
    const samePrices =
      JSON.stringify(r.postmanPrices) === JSON.stringify(r.serverPrices);
    console.log(
      `    Price sets match: ${samePrices} (sample: ${r.postmanPrices.slice(0, 3).join(', ')}...)`,
    );
  }
  console.log('');
});

// Missing airlines check
const EXPECTED = ['PK', 'EK', 'FZ', 'GF', 'EY', 'QR', 'SV', 'WY', 'TK', 'AI'];
console.log('=== EXPECTED AIRLINES CHECK (LHE-DXB market) ===');
for (const code of EXPECTED) {
  const inPm = pm.filter((x) => x.plating === code).length;
  const inSv = sv.filter((x) => x.plating === code).length;
  const inParsed = parsed.filter((x) => x.plating === code).length;
  const present = inPm || inSv || inParsed;
  console.log(
    `${code}: ${present ? 'YES' : 'MISSING'} (Postman=${inPm}, Server=${inSv}, Parsed=${inParsed})`,
  );
}

fs.writeFileSync(
  'C:/ezeeflights-aws/tbl/flight-comparison-itineraries.json',
  JSON.stringify(rows, null, 2),
);
console.log('\nFull list saved to tbl/flight-comparison-itineraries.json');
