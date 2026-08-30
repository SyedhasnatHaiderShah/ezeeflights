const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../apps/frontend/public/world-airports.csv");
const outputPath = path.join(__dirname, "../apps/frontend/public/active-airports.json");

console.log("Reading CSV:", csvPath);
const content = fs.readFileSync(csvPath, "utf8");
const lines = content.split("\n").filter(Boolean);

console.log("Total lines:", lines.length);

const activeAirports = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];

  // Custom CSV parser handling quoted fields with commas
  const cols = [];
  let current = "";
  let insideQuote = false;
  for (let c = 0; c < line.length; c++) {
    const char = line[c];
    if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === ',' && !insideQuote) {
      cols.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  cols.push(current.trim().replace(/^"|"$/g, ""));

  if (cols.length < 24) continue;

  const id = cols[0];
  const ident = cols[1];
  const type = cols[2];
  const name = cols[3];
  const country_name = cols[8];
  const municipality = cols[13];
  const gps_code = cols[15];
  const icao_code = cols[16];
  const iata_code = cols[17];
  const keywords = cols[21];
  const score = cols[22];

  // We only include active commercial passenger airports that have a valid 3-letter IATA code
  if (iata_code && iata_code.length === 3 && iata_code !== "iata_code" && type !== "closed") {
    activeAirports.push({
      id,
      ident,
      type,
      name,
      country_name,
      municipality,
      gps_code,
      icao_code,
      iata_code,
      keywords,
      score: parseInt(score) || 0
    });
  }
}

console.log("Filtered active passenger airports:", activeAirports.length);

fs.writeFileSync(outputPath, JSON.stringify(activeAirports, null, 2), "utf8");
console.log("Compiled to:", outputPath);
