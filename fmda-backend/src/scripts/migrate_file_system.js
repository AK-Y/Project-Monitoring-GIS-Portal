const { Pool } = require("pg");
require("dotenv").config({ path: ".env" });

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

const migrate = async () => {
  try {
    console.log("Starting File System Migration...");

    // 1. Create project_files table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_files (
        id SERIAL PRIMARY KEY,
        name_of_work TEXT NOT NULL,
        type_of_work TEXT,
        work_category TEXT,
        project_category TEXT DEFAULT 'Infra-I',
        
        estimated_amount NUMERIC(15,2) DEFAULT 0,
        
        status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, RETURNED, REJECTED
        current_holder_role VARCHAR(50) DEFAULT 'JE',
        current_holder_id INTEGER, -- User ID who currently has the file
        
        created_by INTEGER NOT NULL, -- User ID of JE who created it
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created 'project_files' table.");

    // 2. Create file_movement_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS file_movement_logs (
        id SERIAL PRIMARY KEY,
        file_id INTEGER NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER,
        from_role VARCHAR(50),
        to_role VARCHAR(50),
        action VARCHAR(50), -- FORWARD, RETURN, APPROVE, REJECT
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created 'file_movement_logs' table.");

    // 3. Create estimate_master table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS estimate_master (
        id SERIAL PRIMARY KEY,
        file_id INTEGER NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
        total_amount NUMERIC(15,2) DEFAULT 0,
        version INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created 'estimate_master' table.");

    // 4. Create estimate_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS estimate_items (
        id SERIAL PRIMARY KEY,
        estimate_id INTEGER NOT NULL REFERENCES estimate_master(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity NUMERIC(15,3) DEFAULT 0,
        unit VARCHAR(20),
        rate NUMERIC(15,2) DEFAULT 0,
        amount NUMERIC(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created 'estimate_items' table.");

    // 5. Create file_assets table (Proposed assets)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS file_assets (
        id SERIAL PRIMARY KEY,
        file_id INTEGER NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
        asset_id VARCHAR(50), -- Link to master asset if exists
        
        -- Geometry and metadata for proposed work
        start_latitude DOUBLE PRECISION,
        start_longitude DOUBLE PRECISION,
        end_latitude DOUBLE PRECISION,
        end_longitude DOUBLE PRECISION,
        location_data JSONB, -- For vertices/linestrings
        
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created 'file_assets' table.");

    // 6. Add file_id to projects table
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='file_id') THEN
          ALTER TABLE projects ADD COLUMN file_id INTEGER REFERENCES project_files(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    console.log("Updated 'projects' table with 'file_id' column.");

    console.log("File System Migration Completed Successfully.");

  } catch (err) {
    console.error("Migration Failed:", err);
  } finally {
    pool.end();
  }
};

migrate();
