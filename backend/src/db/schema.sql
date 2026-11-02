-- LankaLocate PostgreSQL Relational Schema
-- Sri Lanka Administrative and Village Geographical Hierarchy

-- 1. Provinces Table (9 Provinces)
CREATE TABLE IF NOT EXISTS provinces (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_si VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100) NOT NULL,
    capital_en VARCHAR(100),
    capital_si VARCHAR(100),
    capital_ta VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    area_sq_km DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Districts Table (25 Districts)
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    province_id INTEGER NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_si VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100) NOT NULL,
    capital_en VARCHAR(100),
    capital_si VARCHAR(100),
    capital_ta VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    area_sq_km DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Divisional Secretariat (DS) Divisions Table (~331 Divisions)
CREATE TABLE IF NOT EXISTS ds_divisions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_si VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Grama Niladhari (GN) Divisions Table (~14,022 Divisions)
CREATE TABLE IF NOT EXISTS gn_divisions (
    id SERIAL PRIMARY KEY,
    gn_code VARCHAR(30) NOT NULL, -- e.g., '528A', 'MS/12'
    ds_division_id INTEGER NOT NULL REFERENCES ds_divisions(id) ON DELETE CASCADE,
    name_en VARCHAR(120) NOT NULL,
    name_si VARCHAR(120) NOT NULL,
    name_ta VARCHAR(120) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_gn_in_ds UNIQUE (ds_division_id, gn_code)
);

-- 5. Villages / Localities Table
-- Multiple villages in Sri Lanka have identical names across different GN/DS divisions!
CREATE TABLE IF NOT EXISTS villages (
    id SERIAL PRIMARY KEY,
    gn_division_id INTEGER NOT NULL REFERENCES gn_divisions(id) ON DELETE CASCADE,
    name_en VARCHAR(150) NOT NULL,
    name_si VARCHAR(150) NOT NULL,
    name_ta VARCHAR(150) NOT NULL,
    postal_code VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_verified BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Village Alternative / Search Names (for search optimization and aliases)
CREATE TABLE IF NOT EXISTS village_names (
    id SERIAL PRIMARY KEY,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    language VARCHAR(10) NOT NULL, -- 'en', 'si', 'ta'
    is_primary BOOLEAN DEFAULT FALSE
);

-- 7. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Indexes for lightning-fast village searches across languages
CREATE INDEX IF NOT EXISTS idx_villages_name_en ON villages (LOWER(name_en));
CREATE INDEX IF NOT EXISTS idx_villages_name_si ON villages (name_si);
CREATE INDEX IF NOT EXISTS idx_villages_name_ta ON villages (name_ta);
CREATE INDEX IF NOT EXISTS idx_villages_gn ON villages (gn_division_id);

CREATE INDEX IF NOT EXISTS idx_gn_ds ON gn_divisions (ds_division_id);
CREATE INDEX IF NOT EXISTS idx_gn_name_en ON gn_divisions (LOWER(name_en));
CREATE INDEX IF NOT EXISTS idx_gn_code ON gn_divisions (gn_code);

CREATE INDEX IF NOT EXISTS idx_ds_district ON ds_divisions (district_id);
CREATE INDEX IF NOT EXISTS idx_ds_name_en ON ds_divisions (LOWER(name_en));

CREATE INDEX IF NOT EXISTS idx_districts_province ON districts (province_id);
CREATE INDEX IF NOT EXISTS idx_districts_name_en ON districts (LOWER(name_en));

CREATE INDEX IF NOT EXISTS idx_village_names_lookup ON village_names (LOWER(name));
