-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Assets Table (Roads, Drains, etc.)
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Road', 'Drain', 'Sewer'
    zone VARCHAR(50),
    ward VARCHAR(50),
    length NUMERIC(10, 2), -- in km
    width NUMERIC(10, 2), -- in m
    geometry GEOMETRY(LineString, 4326), -- Spatial Data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_uid VARCHAR(50), -- Manual Project ID (e.g., FMDA-2024-001) - Optional
    asset_id INTEGER REFERENCES assets(id),
    name_of_work TEXT NOT NULL,
    type_of_work VARCHAR(100), -- 'New Construction', 'Repair'
    work_category VARCHAR(100), -- 'Road', 'Drain', etc.
    name_of_agency VARCHAR(255),
    aa_amount NUMERIC(15, 2),
    aa_date DATE,
    dnit_amount NUMERIC(15, 2),
    dnit_date DATE,
    tender_date DATE,
    allotment_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'ONGOING', 'COMPLETED', 'PENDING'
    budget_during_year NUMERIC(15, 2),
    start_date DATE,
    completion_date DATE,
    revised_completion_date DATE,
    time_limit VARCHAR(50),
    dlp VARCHAR(50),
    physical_progress VARCHAR(20), -- Store as text e.g. "30%"
    financial_progress VARCHAR(20),
    detail_of_payment TEXT,
    project_monitoring_by TEXT,
    project_category VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    bill_no VARCHAR(50),
    payment_date DATE,
    amount NUMERIC(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Assets (Detailed Engineering Data)
CREATE TABLE project_assets (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    asset_id VARCHAR(50), -- Can be custom or linked
    road_taken_over_from VARCHAR(255),
    year_of_taken_over INTEGER,
    history_of_road TEXT,
    start_point TEXT,
    start_latitude DOUBLE PRECISION,
    start_longitude DOUBLE PRECISION,
    end_point TEXT,
    end_latitude DOUBLE PRECISION,
    end_longitude DOUBLE PRECISION,
    length VARCHAR(100),
    width_of_carriage_way VARCHAR(255),
    width_of_central_verge TEXT,
    width_of_footpath TEXT,
    lhs_green_belt TEXT,
    rhs_green_belt TEXT,
    street_lights TEXT,
    row_width VARCHAR(100),
    type_of_road VARCHAR(255),
    paved_portion_lhs VARCHAR(255),
    paved_portion_rhs VARCHAR(255),
    cross_section_of_road TEXT,
    storm_water_drain_lhs TEXT,
    storm_water_drain_rhs TEXT,
    vertices JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Progress Log (Audit Trail)
CREATE TABLE project_progress_log (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    physical_progress_percent NUMERIC(5, 2),
    financial_progress_percent NUMERIC(5, 2),
    remarks TEXT,
    updated_on DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_asset_id ON projects(asset_id);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'VIEWER', -- 'ADMIN', 'JE', 'VIEWER'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-Many Link Table for Manual Asset IDs
CREATE TABLE project_asset_links (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    asset_code VARCHAR(50) NOT NULL, -- The manual code entered (e.g., "A-123")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, asset_code)
);

-- Index for fast lookup by asset code
CREATE INDEX idx_asset_links_code ON project_asset_links(asset_code);
