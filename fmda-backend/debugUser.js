const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const checkUser = async () => {
  try {
    console.log("--- DEBUGGER START ---");
    console.log(`Connecting to DB: ${process.env.PGDATABASE} as ${process.env.PGUSER}`);
    
    // 1. Get User
    const res = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    if (res.rows.length === 0) {
      console.log("❌ ERROR: User 'admin' does NOT exist in the database.");
    } else {
      const user = res.rows[0];
      console.log("✅ User 'admin' found.");
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Stored Hash: ${user.password_hash.substring(0, 20)}...`);

      // 2. Test Password
      const isMatch = await bcrypt.compare('admin123', user.password_hash);
      if (isMatch) {
         console.log("✅ Password 'admin123' MATCHES the stored hash.");
      } else {
         console.log("❌ Password 'admin123' does NOT match the stored hash.");
         
         // Fix it immediately if wrong
         console.log("   Attempting to reset password...");
         const newHash = await bcrypt.hash('admin123', 10);
         await pool.query("UPDATE users SET password_hash = $1 WHERE username = 'admin'", [newHash]);
         console.log("✅ Password has been reset to 'admin123'. Try logging in now.");
      }
    }
    console.log("--- DEBUGGER END ---");

  } catch (err) {
    console.error("❌ DB Connection Error:", err);
  } finally {
    pool.end();
  }
};

checkUser();
