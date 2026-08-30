import { FlightListItem } from '../types/flight-api';
import { FlightFilters } from '../store/flight-filter-store';

function normalizeCabin(value?: string | null): string {
  if (!value?.trim()) return '';
  return value.trim().toUpperCase().replace(/[\s-_]+/g, '');
}

export function filterFlights(flights: FlightListItem[], filters: FlightFilters): FlightListItem[] {
  return flights.filter((flight) => {
    // 1. Stops Filter
    const stopCount = flight.stops;
    if (stopCount === 0 && !filters.stops.nonstop) return false;
    if (stopCount === 1 && !filters.stops.oneStop) return false;
    if (stopCount >= 2 && !filters.stops.twoStops) return false;

    // 2. Airlines Filter
    if (filters.airlines.length > 0) {
      const airlineCode = flight.airline.code;
      if (!airlineCode || !filters.airlines.includes(airlineCode)) return false;
    }

    // 3. Price Filter (Assuming priceRange is absolute values)
    if (flight.totalCost < filters.priceRange[0] || flight.totalCost > filters.priceRange[1]) {
      return false;
    }

    // 4. Duration Filter (Percentage based on max duration in data)
    const maxDurationMins = 72 * 60; // 72 hours
    const minDurationAllowed = (filters.durationRange[0] / 100) * maxDurationMins;
    const maxDurationAllowed = (filters.durationRange[1] / 100) * maxDurationMins;
    if (flight.totalTime < minDurationAllowed || flight.totalTime > maxDurationAllowed) {
      return false;
    }

    // 5. Time Filter (Takeoff) - Mapping 0-100 to 0-24 hours
    const firstSegment = flight.outbound[0];
    if (firstSegment) {
      const depDate = new Date(firstSegment.departureDate);
      const depMinutes = depDate.getHours() * 60 + depDate.getMinutes();
      const minDepMinutes = (filters.takeoffRange[0] / 100) * 1440;
      const maxDepMinutes = (filters.takeoffRange[1] / 100) * 1440;
      if (depMinutes < minDepMinutes || depMinutes > maxDepMinutes) return false;
    }

    // 6. Time Filter (Landing)
    const lastSegment = flight.outbound[flight.outbound.length - 1];
    if (lastSegment) {
      const arrDate = new Date(lastSegment.arrivalDate);
      const arrMinutes = arrDate.getHours() * 60 + arrDate.getMinutes();
      const minArrMinutes = (filters.landingRange[0] / 100) * 1440;
      const maxArrMinutes = (filters.landingRange[1] / 100) * 1440;
      if (arrMinutes < minArrMinutes || arrMinutes > maxArrMinutes) return false;
    }

    // 7. Cabin Class Filter (skip when user selected "all cabins")
    const filterCabins = filters.cabinClass
      .map((c) => normalizeCabin(c))
      .filter((c) => c && c !== 'ALL');
    if (filterCabins.length > 0) {
      // Use the top-level cabinClass (from flight.flightClass numeric — authoritative)
      // and availableCabinClasses. Do NOT use segment cabinClass (unreliable from GDS).
      const flightCabin = normalizeCabin(flight.cabinClass);
      const available = (flight.availableCabinClasses || []).map(normalizeCabin);
      const allCabins = [flightCabin, ...available].filter(Boolean);
      if (!allCabins.some((c) => filterCabins.includes(c))) return false;
    }

    // 8. Layover Airports Filter
    if (filters.layoverAirports.length > 0) {
      const layovers = flight.outbound.slice(1).map(s => s.fromAirport.code);
      if (!layovers.some(a => filters.layoverAirports.includes(a))) return false;
    }

    // 9. Smart Query (Basic keyword search in airline name or airports)
    if (filters.smartQuery.trim()) {
      const query = filters.smartQuery.toLowerCase();
      const airlineName = flight.airline.name?.toLowerCase() || '';
      const airports = flight.outbound.flatMap(s => [s.fromAirport.code.toLowerCase(), s.toAirport.code.toLowerCase()]);
      if (!airlineName.includes(query) && !airports.some(a => a.includes(query))) {
        return false;
      }
    }

    // 10. Flight Number Filter
    if (filters.flightNumber && filters.flightNumber.trim() !== '') {
      const query = filters.flightNumber.trim().toLowerCase();
      const matchOutbound = flight.outbound.some(
        (s) => s.flightNo && s.flightNo.toLowerCase().includes(query)
      );
      const matchInbound = flight.inbound && flight.inbound.some(
        (s) => s.flightNo && s.flightNo.toLowerCase().includes(query)
      );
      if (!matchOutbound && !matchInbound) {
        return false;
      }
    }

    return true;
  });
}
