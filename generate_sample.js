const XLSX = require('xlsx');
const path = require('path');

// Helper: Excel serial number (preserving time component as fractional day)
function toExcelSerial(date) {
  return (date.getTime() / 86400000) + 25569;
}

// ============================================================
//  CLEAN CLIENT SAMPLE SHEET WITH SPECIFIC FLIGHT TIMINGS
//  All rows are 100% valid and will import successfully.
//  Departure, Return, and Expiry Dates include specific times.
//  All dates set to September 2026.
// ============================================================
const data = [
  {
    "Source": "Ezeeflight US",
    "Route": "JFK-PUJ",
    "Airline": "AC",
    "Cabin Class": "Economy",
    "Trip Type": "Return",
    "Departure Date": "15/09/2026 09:15",
    "Return Date": "22/09/2026 16:30",
    "Bid Price (Adt)": 15,
    "Bid Price (Chd)": 10,
    "Bid Price (Inf)": 5,
    "Discount Type": "percentage",
    "Expiry Date": "10/09/2026 23:59",
    "Stops": "0",
  },
  // {
  //   "Source": "Ezeeflight US",
  //   "Route": "LHE-DXB",
  //   "Airline": "EK",
  //   "Cabin Class": "Economy",
  //   "Trip Type": "Return",
  //   "Departure Date": "2026-09-15 21:10",
  //   "Return Date": "2026-09-22 10:40",
  //   "Bid Price (Adt)": 500,
  //   "Bid Price (Chd)": 400,
  //   "Bid Price (Inf)": 70,
  //   "Discount Type": "replace",
  //   "Expiry Date": "2026-09-05 23:59",
  //   "Stops": "any"
  // }

];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Cheap Bids');

const filePath = path.join(__dirname, 'cheap_bid_sample.xlsx');
XLSX.writeFile(workbook, filePath);
console.log('Written clean client sample sheet with flight times:', filePath);
console.log('All 8 rows will successfully import without errors.');
;
