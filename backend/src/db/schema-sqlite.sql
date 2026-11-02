-- LankaLocate SQLite Relational Schema
-- Sri Lanka Administrative and Village Geographical Hierarchy

CREATE TABLE IF NOT EXISTS provinces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_si TEXT NOT NULL,
    name_ta TEXT NOT NULL,
    capital_en TEXT,
    capital_si TEXT,
    capital_ta TEXT,
    latitude REAL,
    longitude REAL,
    area_sq_km REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    province_id INTEGER NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_si TEXT NOT NULL,
    name_ta TEXT NOT NULL,
    capital_en TEXT,
    capital_si TEXT,
    capital_ta TEXT,
    latitude REAL,
    longitude REAL,
    area_sq_km REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ds_divisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_si TEXT NOT NULL,
    name_ta TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gn_divisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gn_code TEXT NOT NULL,
    ds_division_id INTEGER NOT NULL REFERENCES ds_divisions(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_si TEXT NOT NULL,
    name_ta TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ds_division_id, gn_code)
);

CREATE TABLE IF NOT EXISTS villages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gn_division_id INTEGER NOT NULL REFERENCES gn_divisions(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_si TEXT NOT NULL,
    name_ta TEXT NOT NULL,
    postal_code TEXT,
    latitude REAL,
    longitude REAL,
    is_verified INTEGER DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS village_names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    language TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

CREATE INDEX IF NOT EXISTS idx_villages_name_en ON villages (name_en);
CREATE INDEX IF NOT EXISTS idx_villages_name_si ON villages (name_si);
CREATE INDEX IF NOT EXISTS idx_villages_name_ta ON villages (name_ta);
CREATE INDEX IF NOT EXISTS idx_villages_gn ON villages (gn_division_id);

CREATE INDEX IF NOT EXISTS idx_gn_ds ON gn_divisions (ds_division_id);
CREATE INDEX IF NOT EXISTS idx_gn_name_en ON gn_divisions (name_en);
CREATE INDEX IF NOT EXISTS idx_gn_code ON gn_divisions (gn_code);

CREATE INDEX IF NOT EXISTS idx_ds_district ON ds_divisions (district_id);
CREATE INDEX IF NOT EXISTS idx_ds_name_en ON ds_divisions (name_en);

CREATE INDEX IF NOT EXISTS idx_districts_province ON districts (province_id);
CREATE INDEX IF NOT EXISTS idx_districts_name_en ON districts (name_en);

CREATE INDEX IF NOT EXISTS idx_village_names_lookup ON village_names (name);
