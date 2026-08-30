import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { CarService } from "../modules/cars/cars.service";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function run() {
  console.log("🚀 Bootstrapping NestJS for Cars Test...");
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ["error", "warn", "log"] });
  const carService = app.get(CarService);

  console.log("\n🚗 Calling searchCars via Travelport API...");
  try {
    const cars = await carService.searchCars({
      pickupLocationId: "LHE",
      dropoffLocationId: "DXB",
      pickupDate: "2026-06-25T10:00:00",
      dropoffDate: "2026-06-30T10:00:00",
      category: "All",
    });
    console.log("✅ Cars fetched successfully. Found:", cars.length);
    if (cars.length > 0) {
      console.log(cars[0]);
    }
  } catch (err: any) {
    console.error("❌ Failed to fetch cars:", err.message);
  }

  console.log("\n🚗 Calling createBooking via Travelport API...");
  try {
    const booking = await carService.createBooking("df09c6c7-acca-4b62-ad96-2128cd24cb5d", {
      carId: "car-tp-0-AV",
      pickupLocationId: "LHE",
      dropoffLocationId: "DXB",
      pickupDatetime: "2026-06-25T10:00:00",
      dropoffDatetime: "2026-06-30T10:00:00",
      insuranceType: "basic",
      driverName: "John Doe",
      driverLicenseNumber: "DL123456",
      driverNationality: "US",
    });
    console.log("✅ Booking created successfully:", booking.id);
  } catch (err: any) {
    console.error("❌ Failed to create booking:", err.message);
  }

  process.exit(0);
}

run();
