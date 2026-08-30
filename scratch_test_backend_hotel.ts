import axios from 'axios';

async function testBackend() {
  try {
    const response = await axios.get('http://localhost:4000/v1/hotels/search', {
      params: {
        city: 'DXB',
        checkInDate: '2026-06-15',
        checkOutDate: '2026-06-20',
        adults: 2,
        rooms: 1,
        currency: 'USD'
      }
    });
    console.log('Search successful:', response.data.length, 'hotels found');
  } catch (error: any) {
    console.error('Search failed:', error.response?.data || error.message);
  }
}

testBackend();
