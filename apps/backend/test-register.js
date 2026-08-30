const axios = require('axios');

async function testRegister() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/auth/register', {
      email: `test${Date.now()}@test.com`,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

testRegister();
