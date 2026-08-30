import { TravelportProvider } from "../apps/backend/src/common/providers/travelport.provider";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../apps/backend/.env") });

const dummyLogger = {
  debug: (...args: any[]) => console.log("[DEBUG]", ...args),
  info: (...args: any[]) => console.log("[INFO]", ...args),
  warn: (...args: any[]) => console.warn("[WARN]", ...args),
  error: (...args: any[]) => console.error("[ERROR]", ...args),
} as any;

async function run() {
  console.log("🏨 Testing enhanced TravelportProvider hotel methods (No Mock Data) with full media and details retrieval...");
  const provider = new TravelportProvider(dummyLogger);

  const checkIn = "2026-08-10";
  const checkOut = "2026-08-15";
  const city = "PAR"; // Paris / ROISSY

  console.log(`\n1️⃣ Testing searchHotels for ${city} with ReturnAmenities=true...`);
  let foundHotels: any[] = [];
  try {
    foundHotels = await provider.searchHotels({
      city,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: 2,
      rooms: 1,
      currency: "USD",
    });
    console.log("✅ searchHotels returned:", foundHotels.length, "hotels");
    if (foundHotels.length > 0) {
      console.log("Sample hotel [0] rich output:", JSON.stringify(foundHotels[0], null, 2).slice(0, 1500));
    }
  } catch (err: any) {
    console.error("❌ searchHotels failed:", err.message);
  }

  const sampleHotel = foundHotels[0] || { chainCode: "OL", hotelCode: "I7521", id: "OL-I7521" };
  const chainCode = sampleHotel.chainCode;
  const hotelCode = sampleHotel.hotelCode;

  console.log(`\n2️⃣ Testing getHotelDetails (Live SOAP HotelDetailsReq with RateRuleDetail=Complete) for ${chainCode}-${hotelCode}...`);
  try {
    const details = await provider.getHotelDetails(hotelCode, chainCode, checkIn, checkOut, city);
    if (details) {
      console.log("✅ getHotelDetails returned authentic details:");
      console.log(" - CheckIn/CheckOut:", details.checkInTime, "/", details.checkOutTime);
      console.log(" - Phone/Fax:", details.phoneNumber, "/", details.faxNumber);
      console.log(" - Facilities Count:", details.amenities?.length);
      console.log(" - Services Count:", details.services?.length);
      console.log(" - Dining Info:", details.diningInfo?.slice(0, 3));
      console.log(" - Rooms Count:", details.rooms?.length);
      if (details.rooms?.length > 0) {
        console.log("   Sample Room [0]:", JSON.stringify(details.rooms[0], null, 2));
      }
    } else {
      console.log("⚠️ getHotelDetails returned null.");
    }
  } catch (err: any) {
    console.error("❌ getHotelDetails failed:", err.message);
  }

  console.log(`\n3️⃣ Testing getRooms for ${chainCode}-${hotelCode}...`);
  let rooms: any[] = [];
  try {
    rooms = await provider.getRooms(`${chainCode}-${hotelCode}`);
    console.log("✅ getRooms returned:", rooms.length, "authentic room rates");
    if (rooms.length > 0) {
      console.log("Sample Room [0] details:", JSON.stringify(rooms[0], null, 2));
    }
  } catch (err: any) {
    console.error("❌ getRooms failed:", err.message);
  }

  console.log(`\n4️⃣ Testing getHotelRules (HotelRulesReq) using real rate plan from rooms...`);
  try {
    const ratePlan = rooms[0]?.ratePlanType || "A0GLV0";
    const basePrice = rooms[0]?.pricePerNight ? `${rooms[0].currency || "EUR"}${rooms[0].pricePerNight}.00` : "EUR1254.00";
    console.log(`Looking up rules for RatePlanType=${ratePlan}, Base=${basePrice}...`);
    const rules = await provider.getHotelRules({
      chainCode,
      hotelCode,
      city,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      ratePlanType: ratePlan,
      basePrice: basePrice,
      adults: 2,
      rooms: 1,
    });
    if (rules) {
      console.log("✅ getHotelRules itemized output:");
      console.log(" - Room Details:", rules.roomDetails?.slice(0, 5));
      console.log(" - Room Rates / Meals:", rules.roomRates?.slice(0, 5));
      console.log(" - Rate Descriptions:", rules.rateDescriptions?.slice(0, 5));
      console.log(" - Rules Summary Keys:", Object.keys(rules.rulesSummary || {}));
    } else {
      console.log("⚠️ getHotelRules returned null.");
    }
  } catch (err: any) {
    console.error("❌ getHotelRules failed:", err.message);
  }

  console.log(`\n5️⃣ Testing getHotelMediaLinks (HotelMediaLinksReq) for ${chainCode}-${hotelCode} and HY-07320 (Hyatt House Denver)...`);
  try {
    const media1 = await provider.getHotelMediaLinks({ hotelCode, chainCode });
    console.log(`Media results for ${chainCode}-${hotelCode}:`, media1?.mediaItems?.length || 0, "items");
    if (media1 && media1.mediaItems && media1.mediaItems.length > 0) {
      console.log("Sample item [0]:", JSON.stringify(media1.mediaItems[0], null, 2));
      console.log("Sample item [1]:", JSON.stringify(media1.mediaItems[1], null, 2));
    }
  } catch (err: any) {
    console.error(`❌ getHotelMediaLinks for ${chainCode}-${hotelCode} failed:`, err.message);
  }

  try {
    const media2 = await provider.getHotelMediaLinks({ hotelCode: "07320", chainCode: "HY" });
    console.log("Media results for HY-07320 (Hyatt):", media2?.mediaItems?.length || 0, "items");
    if (media2 && media2.mediaItems && media2.mediaItems.length > 0) {
      console.log("Sample item [0]:", JSON.stringify(media2.mediaItems[0], null, 2));
      console.log("Sample item [1]:", JSON.stringify(media2.mediaItems[1], null, 2));
    }
  } catch (err: any) {
    console.error("❌ getHotelMediaLinks for HY-07320 failed:", err.message);
  }

  process.exit(0);
}

run();
