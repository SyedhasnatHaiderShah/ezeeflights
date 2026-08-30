async function run() {
  // 1. Search flights
  const searchUrl = 'http://localhost:4000/v1/flights/search?origin=LHE&destination=DXB&departureDate=2026-06-11&adults=1&cabinClass=ECONOMY&limit=10&page=1';
  console.log('Searching flights at:', searchUrl);

  let searchData;
  try {
    const res = await fetch(searchUrl);
    searchData = await res.json();
    console.log('Search response count:', searchData?.data?.length);
  } catch (err) {
    console.error('Search failed:', err);
    return;
  }

  if (!searchData?.data || searchData.data.length === 0) {
    console.log('No flights returned in search');
    return;
  }

  const flight = searchData.data[0];
  const flightId = flight.id;
  console.log(`Using flightId: ${flightId}, airline: ${flight.airline}, number: ${flight.flightNumber}`);

  // 2. Call price endpoint with cabinClass: "Economy"
  const priceUrl = 'http://localhost:4000/v1/flights/price';
  const payload = {
    flightId,
    cabinClass: 'Economy',
    passengers: [{ type: 'ADT' }]
  };

  console.log(`Posting to ${priceUrl} with cabinClass: "Economy"`);
  try {
    const res = await fetch(priceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Status (Economy):', res.status);
    const text = await res.text();
    console.log('Response (Economy):', text);
  } catch (err) {
    console.error('Price fetch failed:', err);
  }

  // 3. Call price endpoint without cabinClass
  const payloadNoCabin = {
    flightId,
    passengers: [{ type: 'ADT' }]
  };
  console.log(`Posting to ${priceUrl} without cabinClass`);
  try {
    const res = await fetch(priceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadNoCabin)
    });
    console.log('Status (No Cabin):', res.status);
    const text = await res.text();
    console.log('Response (No Cabin):', text);
  } catch (err) {
    console.error('Price fetch failed:', err);
  }
}

run();
