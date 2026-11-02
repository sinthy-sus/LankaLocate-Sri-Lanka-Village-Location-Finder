# 🇱🇰 LankaLocate – Sri Lanka Village & Location Finder

> **Discover Every Place in Sri Lanka.**  
> An authoritative, modern, full-stack geographical and administrative identification platform for Sri Lanka.

[![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](#)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](#)
[![Node](https://img.shields.io/badge/Node-Express-green.svg)](#)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20SQLite-indigo.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](#)

---

## 📖 1. Project Overview

**LankaLocate** is a geographical information platform designed to solve one of the most common challenges in Sri Lankan administrative geography: **identifying the exact administrative hierarchy of any village, town, or locality**.

When a user searches for a place name, LankaLocate delivers an verified administrative chain:
1. **Village / Locality Name** (English, Sinhala, Tamil)
2. **Grama Niladhari (GN) Division** & official GN code
3. **Divisional Secretariat (DS) Division**
4. **Administrative District** (from the 25 official districts)
5. **Province** (from the 9 provinces)
6. **Country**: Sri Lanka (ශ්‍රී ලංකාව / இலங்கை)
7. **Geographic Coordinates**: Precision Latitude & Longitude
8. **Interactive Geospatial Map**: Leaflet & OpenStreetMap integration

### 🌟 Key Innovation: Identical Village Name Resolution
In Sri Lanka, multiple villages across different districts share identical historical names (e.g., **Aluthgama** exists in Kalutara District, Kandy District, Gampaha District, and Kegalle District; **Pitiyagedara** exists in Gampaha and Kurunegala). LankaLocate isolates each location and provides distinct administrative trails and coordinates without confusion.

---

## 🎨 2. UI/UX Design System

Designed in accordance with modern SaaS and clean geographical platforms:
- **Primary Color:** `#174C3C` (Deep Forest / Heritage Emerald)
- **Secondary Color:** `#25866A` (Vibrant Tropical Green)
- **Background:** `#F7F9F7` (Soft Pearl Surface)
- **Card Background:** `#FFFFFF` (Pure Card Canvas)
- **Text Color:** `#17231E` (High-Contrast Charcoal)
- **Accent Color:** `#D5AC55` (Kandyan Amber Gold)
- **Typography:** Plus Jakarta Sans with full support for Noto Sans Sinhala and Noto Sans Tamil.
- **Icons:** Lucide React icons.

---

## 🏛️ 3. Sri Lanka Administrative Hierarchy

```
[Country: Sri Lanka]
       │
       ▼
[9 Provinces] (Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, Sabaragamuwa)
       │
       ▼
[25 Districts] (Colombo, Gampaha, Kalutara, Kandy, Galle, Jaffna, Badulla, etc.)
       │
       ▼
[331+ Divisional Secretariat (DS) Divisions] (e.g., Hikkaduwa, Beruwala, Colombo, Nallur)
       │
       ▼
[14,022 Grama Niladhari (GN) Divisions] (e.g., Hikkaduwa Town, Fort, 528A, etc.)
       │
       ▼
[Villages / Localities] (e.g., Hikkaduwa, Thiranagama, Dodanduwa, Aluthgama)
```

**Data Authenticity:**
All administrative relationships are grounded in records published by the **Department of Census and Statistics (DCS) Sri Lanka**, the **Survey Department of Sri Lanka**, and the **Ministry of Public Administration**.

---

## 🚀 4. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS with custom branding extensions
- **Mapping:** Leaflet & OpenStreetMap (Voyager / CartoDB tiles)
- **Routing:** React Router v6
- **State & Context:** Multilingual Context (`LanguageContext`), Bookmarks Context (`FavoritesContext`), Admin Authentication (`AuthContext`)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js with Express.js
- **Architecture:** Controller-Route-Service pattern with RESTful endpoints
- **Database Engine:** Dual-mode architecture:
  - **PostgreSQL** via `pg` connection pooling for production deployments
  - **Built-in SQLite** (`node:sqlite` DatabaseSync) for instant zero-dependency local operation
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **File Ingestion:** Multer and streaming CSV parser (`csv-parse`)

---

## 🗄️ 5. Database Schema

The normalized relational database includes complete relational integrity and indexes:

```sql
-- 1. Provinces
CREATE TABLE provinces (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_si VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100) NOT NULL,
    capital_en VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    area_sq_km DOUBLE PRECISION
);

-- 2. Districts
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    province_id INTEGER NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_si VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100) NOT NULL,
    capital_en VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- 3. Divisional Secretariat (DS) Divisions
CREATE TABLE ds_divisions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_si VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- 4. Grama Niladhari (GN) Divisions
CREATE TABLE gn_divisions (
    id SERIAL PRIMARY KEY,
    gn_code VARCHAR(30) NOT NULL,
    ds_division_id INTEGER NOT NULL REFERENCES ds_divisions(id) ON DELETE CASCADE,
    name_en VARCHAR(120) NOT NULL,
    name_si VARCHAR(120) NOT NULL,
    name_ta VARCHAR(120) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    UNIQUE(ds_division_id, gn_code)
);

-- 5. Villages / Localities
CREATE TABLE villages (
    id SERIAL PRIMARY KEY,
    gn_division_id INTEGER NOT NULL REFERENCES gn_divisions(id) ON DELETE CASCADE,
    name_en VARCHAR(150) NOT NULL,
    name_si VARCHAR(150) NOT NULL,
    name_ta VARCHAR(150) NOT NULL,
    postal_code VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_verified BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- 6. Multilingual Search Aliases
CREATE TABLE village_names (
    id SERIAL PRIMARY KEY,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    language VARCHAR(10) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE
);
```

---

## 📡 6. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and database type |
| `GET` | `/api/search?q={query}` | Multilingual search returning full hierarchy |
| `GET` | `/api/search/suggestions?q={query}` | Instant autocomplete suggestions |
| `GET` | `/api/villages/:id` | Full village details, breadcrumb, sibling villages |
| `GET` | `/api/provinces` | All 9 provinces with district and division counts |
| `GET` | `/api/provinces/:codeOrId` | Province details and contained districts |
| `GET` | `/api/districts` | All 25 districts (filterable by `province_id`) |
| `GET` | `/api/districts/:codeOrId` | District details and verified DS divisions |
| `GET` | `/api/ds-divisions/:id` | DS division details and GN division list |
| `GET` | `/api/map/locations` | Verified coordinates for geospatial mapping |
| `GET` | `/api/stats` | National administrative summary metrics |
| `POST` | `/api/admin/login` | Administrator authentication (returns JWT) |
| `GET` | `/api/admin/stats` | Admin metrics & duplicate name detection audit |
| `GET` | `/api/admin/villages` | Paginated admin village management table |
| `POST` | `/api/admin/villages` | Create new village record |
| `PUT` | `/api/admin/villages/:id` | Update existing village record |
| `DELETE`| `/api/admin/villages/:id` | Delete village record |
| `POST` | `/api/admin/import/csv` | Upload and validate bulk CSV dataset |
| `GET` | `/api/admin/export/csv` | Download full verified dataset in CSV format |

---

## 🛠️ 7. Local Setup & Quickstart

### Prerequisites
- **Node.js**: v18+ (Node 22 / 26 recommended)
- **npm**: v9+

### 1. Clone & Navigate
```bash
cd "Lanka Locate"
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 3. Configure Environment Variables
Copy or adjust `.env` files:
```bash
# Backend (.env)
PORT=5001
NODE_ENV=development
JWT_SECRET=your_secure_random_jwt_secret
DB_TYPE=sqlite
SQLITE_PATH=./lankalocate.db

# If using PostgreSQL:
# DB_TYPE=postgres
# DATABASE_URL=postgres://user:password@localhost:5432/lankalocate
```

### 4. Run Development Servers
In separate terminal tabs:

**Terminal 1 (Backend API on http://localhost:5001):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Client on http://localhost:5173):**
```bash
cd frontend
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## 🔐 8. Administrator Access

The administrative dashboard allows public administrators to review data integrity, audit duplicate village names, add/edit records, and import/export CSV datasets.

- **Admin Login URL:** `http://localhost:5173/admin/login`
- **Default Username:** `admin`
- **Default Password:** `Admin@123`

---

## 🚢 9. Production Deployment

### Option A: Using PostgreSQL
1. Create a database in PostgreSQL:
   ```sql
   CREATE DATABASE lankalocate;
   ```
2. Run `schema.sql` on your database:
   ```bash
   psql -U postgres -d lankalocate -f backend/src/db/schema.sql
   ```
3. Set `DATABASE_URL` in your production environment:
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/lankalocate
   DB_TYPE=postgres
   ```
4. Build and start:
   ```bash
   npm run build
   npm start
   ```

### Option B: Unified Single-Port Hosting
The Express backend automatically detects and serves the built frontend from `frontend/dist`.
```bash
# Build both frontend and backend
npm run build

# Start production server
cd backend && npm start
```
The entire application will be live at `http://localhost:5001`.

---

## 📄 10. License
Distributed under the MIT License. Built with pride for Sri Lanka 🇱🇰.
