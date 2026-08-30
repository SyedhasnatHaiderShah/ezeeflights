import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { CheapBidService } from "../modules/cheap-bid/cheap-bid.service";
import { FlightEntity } from "../modules/flight/entities/flight.entity";
import { loadBackendEnv } from "../config/load-env";

loadBackendEnv();

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(CheapBidService);

  const mockSearch = {
    origin: "LGA",
    destination: "PUJ",
    cabinClass: "ECONOMY",
    trip: "one-way",
    flightWay: 1,
    departureDate: "2026-07-15",
    adults: 3,
    children: 0,
    infants: 0,
  };

  const mockFlights: FlightEntity[] = [
    {
      id: "AC-8633-mock",
      flightId: "AC-8633-mock",
      airlineCode: "AC",
      airline: "Air Canada",
      departureAirport: "LGA",
      arrivalAirport: "PUJ",
      departureAt: new Date("2026-07-15T03:45:00.000Z"),
      arrivalAt: new Date("2026-07-15T11:05:00.000Z"),
      totalFare: 306.62,
      baseFare: 306.62,
      currency: "USD",
      rawSegments: [
        {
          Carrier: "AC",
          FlightNumber: "8633",
          Origin: "LGA",
          Destination: "YUL",
          DepartureTime: "2026-07-15T03:45:00.000Z",
          ArrivalTime: "2026-07-15T05:15:00.000Z",
          Group: 0,
        },
        {
          Carrier: "AC",
          FlightNumber: "1424",
          Origin: "YUL",
          Destination: "PUJ",
          DepartureTime: "2026-07-15T06:40:00.000Z",
          ArrivalTime: "2026-07-15T11:05:00.000Z",
          Group: 0,
        }
      ] as any,
    } as any,
  ];

  console.log("Applying cheap bids...");
  const result = await service.applyCheapBidsToFlights(mockFlights, mockSearch);
  console.log("Resulting flights count:", result.length);
  for (const f of result) {
    console.log(`- FlightId: ${f.flightId}, Airline: ${f.airlineCode}${f.flightNumber}, DepartureAt: ${f.departureAt}, cheapBidApplied:`, f.cheapBidApplied);
  }

  await app.close();
}

main().catch(console.error);
