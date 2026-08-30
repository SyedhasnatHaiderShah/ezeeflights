const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../apps/frontend/public/world-airports.csv");

console.log("Analyzing CSV:", csvPath);

const content = fs.readFileSync(csvPath, "utf8");
const lines = content.split("\n").filter(Boolean);
const header = lines[0].split(",");
console.log("Header columns:", header);

// Let's parse rows manually
let total = 0;
let withIata = 0;
let withIataLargeMedium = 0;
let closed = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  // Simple CSV split (handling double quotes)
  const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
  
  // Find index of type, iata_code
  // Let's just find columns:
  // type is index 2, name is index 3, iata_code is index 17
  // Let's do a more robust header index match:
  const cols = [];
  let current = "";
  let insideQuote = false;
  for (let c = 0; c < line.length; c++) {
    const char = line[c];
    if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === ',' && !insideQuote) {
      cols.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cols.push(current.trim());

  if (cols.length < 18) continue;
  
  const type = cols[2];
  const name = cols[3];
  const country = cols[8];
  const iata = cols[17];
  const score = cols[22];

  total++;
  if (iata && iata.length === 3 && iata !== "iata_code") {
    withIata++;
    if (type === "large_airport" || type === "medium_airport" || type === "small_airport") {
      withIataLargeMedium++;
    }
  }
  if (type === "closed") {
    closed++;
  }
}

console.log("Total airports:", total);
console.log("Airports with valid 3-letter IATA code:", withIata);
console.log("Airports with IATA code and large/medium/small type:", withIataLargeMedium);
console.log("Closed airports:", closed);
