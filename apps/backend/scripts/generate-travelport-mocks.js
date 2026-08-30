/**
 * Regenerate mock JSON from logs/travelport_responses/*.xml
 * Usage: node scripts/generate-travelport-mocks.js
 */
const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

const root = path.resolve(__dirname, "..");
const logsDir = path.join(root, "logs/travelport_responses");
const outDir = path.join(root, "src/common/mock-data");

function mapHotelResponse(rsp) {
  const results = rsp["hotel:HotelSearchResult"];
  if (!results) return [];
  const resultsArr = Array.isArray(results) ? results : [results];
  const refPoint = rsp["hotel:ReferencePoint"];
  const fallbackCity = refPoint
    ? refPoint.charAt(0).toUpperCase() + refPoint.slice(1).toLowerCase()
    : "";

  return resultsArr
    .filter((res) => res["hotel:HotelProperty"]?.Availability !== "NotAvailable")
    .map((res) => {
      const prop = res["hotel:HotelProperty"];
      const rateInfo = res["hotel:RateInfo"];
      const totalAmount =
        rateInfo?.MinimumAmount || rateInfo?.ApproximateMinimumAmount || "0";
      let starRating = parseInt(prop.HotelRating?.Rating || "0", 10);
      if (Number.isNaN(starRating)) starRating = 0;

      return {
        id: `${prop.HotelChain}-${prop.HotelCode}`,
        chainCode: prop.HotelChain,
        name: prop.Name,
        city: prop.City || fallbackCity || prop.HotelLocation,
        country: prop.Country || (fallbackCity ? "United Arab Emirates" : ""),
        address: prop.Address || prop.PropertyAddress?.Address || "",
        rating: starRating,
        starRating,
        userRating: 0,
        reviewCount: 0,
        description: prop.Description || "",
        amenities: [],
        images: [],
        isBestForTrip: false,
        minPricePerNight: parseFloat(
          String(totalAmount).replace(/[^\d.]/g, "") || "0",
        ),
        currency: String(totalAmount).replace(/[\d.]/g, "") || "USD",
        rooms: [],
      };
    });
}

function extractHotelRooms(hotelsMap) {
  const detailsXml = path.join(logsDir, "hotel-details-response.xml");
  if (!fs.existsSync(detailsXml)) return;
  
  const json = parser.parse(fs.readFileSync(detailsXml, "utf-8"));
  const body = json["SOAP:Envelope"]?.["SOAP:Body"] || json["soap:Envelope"]?.["soap:Body"];
  const rsp = body?.["hotel:HotelDetailsRsp"];
  if (!rsp) return;
  
  const prop = rsp["hotel:HotelProperty"];
  if (!prop) return;
  const hotelId = `${prop.HotelChain}-${prop.HotelCode}`;
  
  const hotel = hotelsMap.find(h => h.id === hotelId);
  if (!hotel) return;

  const rateDetails = rsp["hotel:HotelDetailItem"]?.["hotel:HotelRateDetail"];
  if (!rateDetails) return;
  const ratesArr = Array.isArray(rateDetails) ? rateDetails : [rateDetails];
  
  hotel.rooms = ratesArr.map((rate, idx) => {
    const total = rate.Total || rate.ApproximateTotal || "0";
    const price = parseFloat(String(total).replace(/[^\d.]/g, "") || "0");
    const currency = String(total).replace(/[\d.]/g, "") || "USD";
    return {
      id: `${hotelId}-room-${idx}`,
      name: rate.RoomRateDescription?.[0]?.["hotel:Text"] || "Standard Room",
      pricePerNight: price,
      totalPrice: price,
      currency,
      description: rate.RoomRateDescription?.map(d => d["hotel:Text"]).join(" ") || "",
      amenities: [],
      images: [],
      breakfastIncluded: false,
      freeCancellation: false,
      isAvailableForUpgrade: false
    };
  });
}

function extractFlights() {
  const flightsXml = path.join(logsDir, "server-response.xml");
  if (!fs.existsSync(flightsXml)) return null;

  // Ideally this uses TravelportProvider.mapResponse, but we don't have ts-node here.
  // Instead of re-implementing mapResponse, we just see if parsed-results.json exists 
  // as the user mentioned the server-response.xml file. 
  // We'll read the existing travelport-flights-search.mock.json since the map logic is huge.
  const flightsMock = path.join(outDir, "travelport-flights-search.mock.json");
  if (fs.existsSync(flightsMock)) {
    return JSON.parse(fs.readFileSync(flightsMock, "utf-8"));
  }
  return [];
}

function extractCars() {
  const rootDir = path.resolve(__dirname, "../../..");
  const carsXml = path.join(rootDir, "Vechicle complete flow.xml");
  if (!fs.existsSync(carsXml)) return null;

  const content = fs.readFileSync(carsXml, "utf-8");
  // The file has multiple SOAP Envelopes. We'll parse the VehicleSearchAvailabilityRsp one.
  const match = content.match(/<vehicle:VehicleSearchAvailabilityRsp[\s\S]*?<\/vehicle:VehicleSearchAvailabilityRsp>/);
  if (!match) return [];
  
  // Wrap to parse
  const xml = `<wrapper>${match[0]}</wrapper>`;
  const parsed = parser.parse(xml);
  const rsp = parsed.wrapper["vehicle:VehicleSearchAvailabilityRsp"];
  
  const vList = rsp["vehicle:Vehicle"];
  if (!vList) return [];
  const vehicles = Array.isArray(vList) ? vList : [vList];
  
  return vehicles.map((veh, i) => {
    const rate = veh["vehicle:VehicleRate"];
    const approx = rate?.["vehicle:ApproximateRate"];
    const baseRate = approx?.EstimatedTotalAmount || approx?.BaseRate || "0";
    const baseRateNum = parseFloat(String(baseRate).replace(/[^\d.]/g, "") || "0");
    const currency = String(baseRate).replace(/[\d.]/g, "") || "INR";
    
    return {
      id: `car-tp-${i}-${veh.VendorCode}-${veh.AcrissVehicleCode}`,
      name: `${veh.VehicleClass} Car`,
      makeModel: "Sample Model", 
      acrissCode: veh.AcrissVehicleCode,
      category: veh.Category,
      passengerCount: 5,
      doorCount: veh.DoorCount === "FourToFiveDoors" ? 5 : 4,
      partnerNetwork: { name: veh.VendorCode },
      pricePerDay: baseRateNum,
      totalPrice: baseRateNum,
      extraMileageCharge: 0,
      distanceUnits: "KM",
      currency,
      features: [veh.TransmissionType, veh.AirConditioning === "true" ? "A/C" : ""].filter(Boolean),
      unlimitedMileage: true,
      freeCancellation: true,
      location: "DXB",
      pickupLocationDetails: veh.Location,
      description: rate?.["vehicle:VehicleRateDescription"]?.["vehicle:Text"] || "",
      vendorLocationKey: veh.VendorLocationKey,
      rateToken: rate?.["vehicle:RateHostIndicator"]?.RateToken,
      rateCode: rate?.RateCode,
      rateAvailability: rate?.RateAvailability,
      rateInclusions: (rate?.["vehicle:RateInclusions"]?.["vehicle:IncludedItem"] || []).map(inc => inc.Description)
    };
  });
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const flights = extractFlights();
  if (flights && flights.length) {
    fs.writeFileSync(
      path.join(outDir, "travelport-flights-search.mock.json"),
      JSON.stringify(flights, null, 2),
    );
    console.log(`Flights: ${flights.length} → travelport-flights-search.mock.json`);
  }

  const hotelsXml = path.join(logsDir, "hotels-server-response.xml");
  if (fs.existsSync(hotelsXml)) {
    const json = parser.parse(fs.readFileSync(hotelsXml, "utf-8"));
    const body =
      json["SOAP:Envelope"]?.["SOAP:Body"] ||
      json["soap:Envelope"]?.["soap:Body"];
    const rsp = body?.["hotel:HotelSearchAvailabilityRsp"];
    const hotels = mapHotelResponse(rsp);
    extractHotelRooms(hotels);
    
    fs.writeFileSync(
      path.join(outDir, "travelport-hotels-search.mock.json"),
      JSON.stringify(hotels, null, 2),
    );
    console.log(`Hotels: ${hotels.length} → travelport-hotels-search.mock.json`);
  }

  const cars = extractCars();
  if (cars && cars.length) {
    fs.writeFileSync(
      path.join(outDir, "travelport-cars-search.mock.json"),
      JSON.stringify(cars, null, 2),
    );
    console.log(`Cars: ${cars.length} → travelport-cars-search.mock.json`);
  }
}

main();
