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
  console.log("🚗 Testing enhanced TravelportProvider car methods...");
  const provider = new TravelportProvider(dummyLogger);

  const pickup = "2026-07-31T10:00:00";
  const dropoff = "2026-08-05T10:00:00";

  console.log("\n1️⃣ Testing searchCars with ReturnMediaLinks=true and ReturnAllRates=true...");
  try {
    const cars = await provider.searchCars({
      pickupLocation: "SFO",
      dropoffLocation: "SFO",
      pickupDate: pickup,
      dropoffDate: dropoff,
    });
    console.log("✅ searchCars returned:", cars.length, "vehicles");
    if (cars.length > 0) {
      console.log("Sample car [0] rich output:", JSON.stringify(cars[0], null, 2).slice(0, 1500));
    }
  } catch (err: any) {
    console.error("❌ searchCars failed:", err.message);
  }

  console.log("\n2️⃣ Testing getCarMediaLinks with structured parsing...");
  try {
    const media = await provider.getCarMediaLinks({
      vendorCode: "ZD",
      pickupLocation: "SFO",
    });
    console.log("✅ getCarMediaLinks structured items:", JSON.stringify(media.mediaItems, null, 2).slice(0, 1000));
  } catch (err: any) {
    console.error("❌ getCarMediaLinks failed:", err.message);
  }

  console.log("\n3️⃣ Testing getCarKeywords with structured parsing...");
  try {
    const kw = await provider.getCarKeywords({
      vendorCode: "ZD",
      pickupLocation: "SFO",
      pickupDate: pickup.split("T")[0],
    });
    console.log("✅ getCarKeywords structured list:", JSON.stringify(kw.keywords, null, 2).slice(0, 1000));
  } catch (err: any) {
    console.error("❌ getCarKeywords failed:", err.message);
  }

  console.log("\n4️⃣ Testing getCarLocationDetail with structured parsing...");
  try {
    const loc = await provider.getCarLocationDetail({
      vendorCode: "ZD",
      pickupLocation: "SFO",
      pickupDateTime: pickup,
      returnDateTime: dropoff,
    });
    console.log("✅ getCarLocationDetail structured info:", JSON.stringify({
      vendorCode: loc.vendorCode,
      locationInfo: loc.locationInfo,
      disclaimer: loc.disclaimer,
      detailsCount: loc.vehicleDetails?.length,
      sampleDetail: loc.vehicleDetails?.[0]
    }, null, 2));
  } catch (err: any) {
    console.error("❌ getCarLocationDetail failed:", err.message);
  }

  console.log("\n5️⃣ Testing getCarRules with structured parsing and DoorCount modifier...");
  try {
    const rules = await provider.getCarRules({
      pickupLocation: "SFO",
      dropoffLocation: "SFO",
      pickupDateTime: pickup,
      returnDateTime: dropoff,
      rateCode: "RCW55",
      vendorCode: "ZT",
      rateToken: "X1777X1007",
      inventoryToken: "A",
      vehicleClass: "Economy",
      category: "Car",
      doorCount: "TwoToFourDoors",
      airConditioning: true,
      transmissionType: "Automatic",
      rateCategory: "Standard",
    });
    console.log("✅ getCarRules structured summary:", JSON.stringify(rules.rulesSummary, null, 2));
  } catch (err: any) {
    console.error("❌ getCarRules failed:", err.message);
  }

  process.exit(0);
}

run();
