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

const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin exists
    const check = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    if (check.rows.length > 0) {
      console.log('Admin user already exists.');
    } else {
      await pool.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'ADMIN')",
        ['admin', hashedPassword]
      );
      console.log('Admin user created: admin / admin123');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
};

seedAdmin();
