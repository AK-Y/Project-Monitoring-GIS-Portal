const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'fmda_gis',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

const resetDb = async () => {
  try {
    console.log('🗑️  Dropping all tables...');
    
    // Drop all tables in public schema
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');

    console.log('📜 Running schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);

    console.log('👤 Seeding Admin User...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'ADMIN')",
        ['admin', hashedPassword]
    );

    console.log('✅ Database reset complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting database:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

resetDb();
