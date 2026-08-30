import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(__dirname, "../public/allCountryCode.csv");
const outPath = path.join(__dirname, "../lib/nationalities.generated.ts");

const csv = fs.readFileSync(csvPath, "utf8");
const lines = csv.trim().split(/\r?\n/).slice(1);

function parseLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      continue;
    }
    if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function getFlagEmoji(alpha2) {
  if (!alpha2 || alpha2.length !== 2) return "🌍";
  try {
    return String.fromCodePoint(
      ...[...alpha2.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
    );
  } catch {
    return "🌍";
  }
}

const rows = lines
  .map(parseLine)
  .filter((r) => r[0]?.trim() && r[1]?.trim())
  .map((r) => {
    const name = r[0].trim();
    const alpha2 = r[1].trim();
    return {
      name,
      alpha2,
      alpha3: (r[2] || "").trim(),
      nationality: name,
      flag: getFlagEmoji(alpha2),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const body = `/** Auto-generated from public/allCountryCode.csv — do not edit by hand */
export interface NationalityCountry {
  name: string;
  nationality: string;
  alpha2: string;
  alpha3: string;
  flag: string;
}

export const NATIONALITIES: NationalityCountry[] = ${JSON.stringify(rows, null, 2)};
`;

fs.writeFileSync(outPath, body, "utf8");
console.log(`Wrote ${rows.length} nationalities to ${outPath}`);
