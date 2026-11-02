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


