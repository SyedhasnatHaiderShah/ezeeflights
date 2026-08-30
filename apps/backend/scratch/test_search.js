async function run() {
  const url = 'http://localhost:4000/v1/flights/search?origin=LHE&destination=DXB&departureDate=2026-06-11&adults=1&cabinClass=ECONOMY&limit=10&page=1';
  console.log('Fetching:', url);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text.substring(0, 1000));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
run();
