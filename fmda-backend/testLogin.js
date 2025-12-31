const axios = require('axios');

async function testLogin() {
  console.log("Attempting login via direct HTTP request...");
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log("✅ LOGIN SUCCESS!");
    console.log("Status:", res.status);
    console.log("Token:", res.data.token ? "Present" : "Missing");
    console.log("User:", res.data.user);
  } catch (err) {
    console.log("❌ LOGIN FAILED");
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", err.response.data);
    } else {
      console.log("Error Message:", err.message);
      console.log("Full Error:", JSON.stringify(err, null, 2));
    }
  }
}

testLogin();
