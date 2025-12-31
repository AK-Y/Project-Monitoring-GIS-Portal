const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'fmda_gis',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

async function checkColumn() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'project_uid';
    `);
    
    if (res.rows.length > 0) {
      console.log("✅ Column 'project_uid' exists in 'projects' table.");
      console.log("Type:", res.rows[0].data_type);
    } else {
      console.error("❌ Column 'project_uid' NOT FOUND in 'projects' table.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}

checkColumn();
