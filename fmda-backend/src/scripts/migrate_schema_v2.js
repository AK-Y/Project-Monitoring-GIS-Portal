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
    console.log("Starting Migration v2...");

    // 1. Drop existing tables if they exist
    await pool.query(`DROP TABLE IF EXISTS project_progress_log CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS payments CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS project_assets CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS projects CASCADE`);

    console.log("Dropped old tables.");

    // 2. Create Projects Table
    await pool.query(`
      CREATE TABLE projects (
        id SERIAL PRIMARY KEY,
        
        type_of_work TEXT,
        name_of_work TEXT,
        
        aa_amount NUMERIC(15,2),
        aa_date DATE,
        
        dnit_amount NUMERIC(15,2),
        dnit_date DATE,
        
        tender_date DATE,
        allotment_date DATE,
        
        name_of_agency TEXT,
        
        start_date DATE,
        time_limit TEXT, 
        dlp TEXT, -- Defect Liability Period
        
        completion_date DATE,
        revised_completion_date DATE,
        
        budget_during_year NUMERIC(15,2),
        
        physical_progress TEXT,
        financial_progress TEXT,
        
        detail_of_payment TEXT,
        project_monitoring_by TEXT,
        
        status VARCHAR(50) DEFAULT 'ONGOING', -- Calculated or Manual field
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created 'projects' table.");

    // 3. Create Project Assets Table
    await pool.query(`
      CREATE TABLE project_assets (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        asset_id VARCHAR(50), -- Optional alphanumeric asset ID provided by JE
        
        road_taken_over_from VARCHAR(100),
        year_of_taken_over INTEGER,
        history_of_road TEXT,
        
        start_point TEXT,
        start_latitude DOUBLE PRECISION,
        start_longitude DOUBLE PRECISION,
        
        end_point TEXT,
        end_latitude DOUBLE PRECISION,
        end_longitude DOUBLE PRECISION,
        
        length TEXT,
        width_of_carriage_way TEXT,
        width_of_central_verge TEXT,
        width_of_footpath TEXT,
        
        lhs_green_belt TEXT,
        rhs_green_belt TEXT,
        
        street_lights TEXT,
        row_width TEXT,
        
        type_of_road TEXT,
        
        paved_portion_lhs TEXT,
        paved_portion_rhs TEXT,
        
        cross_section_of_road TEXT,
        storm_water_drain_lhs TEXT,
        storm_water_drain_rhs TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created 'project_assets' table.");

    // 4. Re-create Dependent Tables (Payments, Logs)
    await pool.query(`
        CREATE TABLE payments (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
            bill_no VARCHAR(50),
            payment_date DATE,
            amount NUMERIC(15, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    await pool.query(`
        CREATE TABLE project_progress_log (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
            physical_progress_percent NUMERIC(5, 2),
            financial_progress_percent NUMERIC(5, 2),
            remarks TEXT,
            updated_on DATE DEFAULT CURRENT_DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log("Re-created dependency tables (payments, logs).");

    // 5. Seed Initial Data
    const insertProject = `
      INSERT INTO projects (
        type_of_work, name_of_work, aa_amount, aa_date, 
        name_of_agency, start_date, completion_date, 
        budget_during_year, physical_progress, status
      ) VALUES (
        'Road Repair', 'Resurfacing of Sector 18 Main Road', 5000000.00, '2024-01-15',
        'ABC Infratech Pvt Ltd', '2024-02-01', '2024-08-01',
        2500000.00, '45% Completed', 'ONGOING'
      ) RETURNING id;
    `;
    const res = await pool.query(insertProject);
    const projectId = res.rows[0].id;

    await pool.query(`
      INSERT INTO project_assets (
        project_id, start_point, end_point, length, width_of_carriage_way, type_of_road
      ) VALUES (
        $1, 'Sector 18 Metro', 'Sector 19 Crossing', '1.2 KM', '14m', 'Bituminous'
      )
    `, [projectId]);

    console.log("Seeded 1 Test Project.");

  } catch (err) {
    console.error("Migration Failed:", err);
  } finally {
    pool.end();
  }
};

migrate();
