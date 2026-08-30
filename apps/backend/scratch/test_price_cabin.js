async function test(cabinClass) {
  const url = 'http://localhost:4000/v1/flights/price';
  const payload = {
    flightId: 'f352c7d2-72af-2ee4-3a56-4427a4bb438b',
    passengers: [{ type: 'ADT' }],
    cabinClass
  };
  console.log(`Testing cabinClass: "${cabinClass}"`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`Status for "${cabinClass}":`, res.status);
    const text = await res.text();
    if (res.status !== 200) {
      console.log('Error Response:', text);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

async function run() {
  await test('Economy');
  await test('Economy');
  await test('ALL');
  await test('Business');
  await test('First');
}
run();
