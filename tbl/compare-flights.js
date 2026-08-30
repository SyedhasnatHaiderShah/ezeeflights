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
      end > start
        ? xml.slice(start, end + endTag.length)
        : xml.slice(start, start + 8000);
    const plating =
      (block.match(/PlatingCarrier="([^"]+)"/) || [])[1] || '';
    const total = (block.match(/TotalPrice="([^"]+)"/) || [])[1] || '';
    const segRe =
      /Group="(\d)"[^>]*Carrier="([^"]+)"[^>]*FlightNumber="([^"]+)"[^>]*Origin="([^"]+)"[^>]*Destination="([^"]+)"[^>]*DepartureTime="([^"]+)"/g;
    const segs = [];
    let sm;
    while ((sm = segRe.exec(block))) {
      segs.push({
        group: sm[1],
        carrier: sm[2],
        fn: sm[3],
        origin: sm[4],
        dest: sm[5],
        dep: sm[6],
      });
    }
    const out = segs
      .filter((s) => s.group === '0')
      .map((s) => `${s.carrier}${s.fn} ${s.origin}-${s.dest}@${s.dep.slice(0, 16)}`)
      .join(' > ');
    const ret = segs
      .filter((s) => s.group === '1')
      .map((s) => `${s.carrier}${s.fn} ${s.origin}-${s.dest}@${s.dep.slice(0, 16)}`)
      .join(' > ');
    solutions.push({ key, plating, total, out, ret, segCount: segs.length });
  }
  return solutions;
}

function loadParsed(p) {
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  return data.map((x) => {
    const segs = x.segments || [];
    const out = segs
      .filter((s) => String(s.Group) === '0')
      .map(
        (s) =>
          `${s.Carrier}${s.FlightNumber} ${s.Origin}-${s.Destination}@${(s.DepartureTime || '').slice(0, 16)}`,
      )
      .join(' > ');
    const ret = segs
      .filter((s) => String(s.Group) === '1')
      .map(
        (s) =>
          `${s.Carrier}${s.FlightNumber} ${s.Origin}-${s.Destination}@${(s.DepartureTime || '').slice(0, 16)}`,
      )
      .join(' > ');
    return {
      key: x.id,
      plating: x.airlineCode,
      total: `${x.currency}${x.price}`,
      out,
      ret,
      stops: x.stops,
    };
  });
}

function countBy(arr, fn) {
  const c = {};
  for (const x of arr) {
    const k = fn(x);
    c[k] = (c[k] || 0) + 1;
  }
  return c;
}

function sig(x) {
  return `${x.plating}|${x.out}|${x.ret}|${x.total}`;
}

const postman = fs.readFileSync(
  'C:/ezeeflights-aws/tbl/postman-response.xml',
  'utf8',
);
const server = fs.readFileSync(
  'C:/ezeeflights-aws/apps/backend/logs/travelport_responses/server-response.xml',
  'utf8',
);
const parsed = loadParsed(
  'C:/ezeeflights-aws/apps/backend/logs/travelport_responses/parsed-results.json',
);

const pm = extractSolutions(postman);
const sv = extractSolutions(server);

console.log('=== COUNTS ===');
console.log('Postman XML solutions:', pm.length);
console.log('Server XML solutions:', sv.length);
console.log('Parsed JSON solutions:', parsed.length);

console.log('\n=== BY PLATING CARRIER ===');
console.log('Postman:', countBy(pm, (x) => x.plating));
console.log('Server:', countBy(sv, (x) => x.plating));
console.log('Parsed:', countBy(parsed, (x) => x.plating));

const pmTx = (postman.match(/TransactionId="([^"]+)"/) || [])[1];
const svTx = (server.match(/TransactionId="([^"]+)"/) || [])[1];
console.log('\n=== TRANSACTION IDs (different call = different inventory) ===');
console.log('Postman:', pmTx);
console.log('Server:', svTx);
console.log('Same response?', pmTx === svTx);

function warnings(xml, name) {
  const re =
    /ResponseMessage[^>]*Code="([^"]+)"[^>]*Type="([^"]+)"[^>]*>([^<]+)/g;
  const out = [];
  let w;
  while ((w = re.exec(xml))) {
    out.push(`${w[1]} (${w[2]}): ${w[3].trim()}`);
  }
  console.log(`${name} warnings:`, out.length ? out : ['none']);
}
warnings(postman, 'Postman');
warnings(server, 'Server');

const pmKeys = new Set(pm.map((x) => x.key));
const svKeys = new Set(sv.map((x) => x.key));
const parsedKeys = new Set(parsed.map((x) => x.key));

console.log('\n=== KEY COMPARISON (Travelport solution Key) ===');
console.log('Keys only in Postman:', pm.filter((x) => !svKeys.has(x.key)).length);
console.log('Keys only in Server:', sv.filter((x) => !pmKeys.has(x.key)).length);
console.log('Server keys missing from parsed:', sv.filter((x) => !parsedKeys.has(x.key)).length);
console.log('Parsed keys not in server:', parsed.filter((x) => !svKeys.has(x.key)).length);

const pmSigs = new Map(pm.map((x) => [sig(x), x]));
const svSigs = new Map(sv.map((x) => [sig(x), x]));
const onlyPmSig = [...pmSigs.keys()].filter((k) => !svSigs.has(k));
const onlySvSig = [...svSigs.keys()].filter((k) => !pmSigs.has(k));

console.log('\n=== ITINERARY+PRICE SIGNATURES ===');
console.log('Unique sigs Postman:', pmSigs.size);
console.log('Unique sigs Server:', svSigs.size);
console.log('Only in Postman:', onlyPmSig.length);
console.log('Only in Server:', onlySvSig.length);

const parsedSigs = new Map(parsed.map((x) => [sig(x), x]));
console.log('Parsed unique sigs:', parsedSigs.size);
console.log(
  'Server sigs missing from parsed:',
  [...svSigs.keys()].filter((k) => !parsedSigs.has(k)).length,
);
console.log(
  'Parsed sigs missing from server:',
  [...parsedSigs.keys()].filter((k) => !svSigs.has(k)).length,
);

function printSample(title, keys, map, limit = 15) {
  console.log(`\n=== ${title} (first ${limit}) ===`);
  keys.slice(0, limit).forEach((k, i) => {
    const x = map.get(k);
    console.log(
      `${i + 1}. ${x.plating} ${x.total} | OUT: ${x.out || '(none)'} | RET: ${x.ret || '(none)'}`,
    );
  });
}

printSample('Sample ONLY IN POSTMAN', onlyPmSig, pmSigs, 10);
printSample('Sample ONLY IN SERVER', onlySvSig, svSigs, 10);

// Full airline list present / missing
const allPlating = new Set([
  ...pm.map((x) => x.plating),
  ...sv.map((x) => x.plating),
  ...parsed.map((x) => x.plating),
]);
console.log('\n=== AIRLINE PRESENCE MATRIX ===');
for (const code of [...allPlating].sort()) {
  console.log(
    `${code}: Postman=${pm.filter((x) => x.plating === code).length} Server=${sv.filter((x) => x.plating === code).length} Parsed=${parsed.filter((x) => x.plating === code).length}`,
  );
}

// Export compact comparison for user
const exportRows = [];
const allSigs = new Set([...pmSigs.keys(), ...svSigs.keys(), ...parsedSigs.keys()]);
for (const s of [...allSigs].sort()) {
  exportRows.push({
    signature: s,
    inPostman: pmSigs.has(s),
    inServer: svSigs.has(s),
    inParsed: parsedSigs.has(s),
  });
}
fs.writeFileSync(
  'C:/ezeeflights-aws/tbl/flight-comparison-summary.json',
  JSON.stringify(
    {
      counts: {
        postman: pm.length,
        server: sv.length,
        parsed: parsed.length,
      },
      byPlating: {
        postman: countBy(pm, (x) => x.plating),
        server: countBy(sv, (x) => x.plating),
        parsed: countBy(parsed, (x) => x.plating),
      },
      transactionIds: { postman: pmTx, server: svTx },
      onlyInPostman: onlyPmSig.length,
      onlyInServer: onlySvSig.length,
      rows: exportRows,
    },
    null,
    2,
  ),
);
console.log('\nWrote tbl/flight-comparison-summary.json');
