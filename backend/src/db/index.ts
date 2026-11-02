import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

// Native Node 22+ SQLite
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DbAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  get<T = any>(sql: string, params?: any[]): Promise<T | null>;
  run(sql: string, params?: any[]): Promise<{ lastInsertRowid?: number | bigint; changes?: number }>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
  isPostgres(): boolean;
}

class PostgresAdapter implements DbAdapter {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
  }

  isPostgres(): boolean {
    return true;
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const res = await this.pool.query(sql, params);
    return res.rows as T[];
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async run(sql: string, params: any[] = []): Promise<{ lastInsertRowid?: number | bigint; changes?: number }> {
    const res = await this.pool.query(sql, params);
    return {
      changes: res.rowCount ?? 0,
      lastInsertRowid: (res.rows && res.rows[0] && res.rows[0].id) ? res.rows[0].id : undefined,
    };
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

class SqliteAdapter implements DbAdapter {
  private db: any;

  constructor(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new DatabaseSync(filePath);
    this.db.exec('PRAGMA foreign_keys = ON;');
  }

  isPostgres(): boolean {
    return false;
  }

  // Convert $1, $2 (PostgreSQL style) to ? (SQLite style) if present
  private normalizeSql(sql: string): string {
    return sql.replace(/\$(\d+)/g, '?');
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const normalized = this.normalizeSql(sql);
    const stmt = this.db.prepare(normalized);
    return stmt.all(...params) as T[];
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const normalized = this.normalizeSql(sql);
    const stmt = this.db.prepare(normalized);
    const result = stmt.get(...params);
    return (result || null) as T | null;
  }

  async run(sql: string, params: any[] = []): Promise<{ lastInsertRowid?: number | bigint; changes?: number }> {
    const normalized = this.normalizeSql(sql);
    const stmt = this.db.prepare(normalized);
    const result = stmt.run(...params);
    return {
      lastInsertRowid: result.lastInsertRowid,
      changes: result.changes,
    };
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

let dbInstance: DbAdapter;

if (config.dbType === 'postgres' && config.databaseUrl) {
  console.log('Connecting to PostgreSQL database...');
  dbInstance = new PostgresAdapter(config.databaseUrl);
} else {
  console.log(`Using built-in SQLite database at: ${config.sqlitePath}`);
  dbInstance = new SqliteAdapter(config.sqlitePath);
}

export const db = dbInstance;

function getSchemaPath(filename: string): string {
  const directPath = path.join(__dirname, filename);
  if (fs.existsSync(directPath)) return directPath;
  const srcPath = path.join(__dirname, '../../src/db', filename);
  if (fs.existsSync(srcPath)) return srcPath;
  return directPath;
}

function getDataDir(): string {
  const directPath = path.join(__dirname, 'data');
  if (fs.existsSync(directPath)) return directPath;
  const srcPath = path.join(__dirname, '../../src/db/data');
  if (fs.existsSync(srcPath)) return srcPath;
  return directPath;
}

export async function initDatabase(): Promise<void> {
  const schemaFile = db.isPostgres() ? 'schema.sql' : 'schema-sqlite.sql';
  const schemaPath = getSchemaPath(schemaFile);

  if (fs.existsSync(schemaPath)) {
    console.log(`Initializing database schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await db.exec(schemaSql);
  }

  // Check if admin user exists, if not create default admin
  const existingAdmin = await db.get('SELECT id FROM admin_users WHERE username = ?', [config.adminDefaultUsername]);
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(config.adminDefaultPassword, salt);
    await db.run(
      'INSERT INTO admin_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [config.adminDefaultUsername, config.adminDefaultEmail, hash, 'superadmin']
    );
    console.log(`Created default admin user: ${config.adminDefaultUsername} / ${config.adminDefaultPassword}`);
  }

  // Check if provinces exist, if not run automatic seeding
  const provinceCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM provinces');
  const count = provinceCount ? Number(provinceCount.count) : 0;
  if (count === 0) {
    console.log('Database is empty. Populating with verified Sri Lanka administrative data...');
    await seedDatabase();
  } else {
    console.log(`Database already populated (${count} provinces).`);
  }
}

export async function seedDatabase(): Promise<void> {
  try {
    const dataDir = getDataDir();
    const provincesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'provinces.json'), 'utf-8'));
    const districtsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'districts.json'), 'utf-8'));
    const dsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'ds_divisions.json'), 'utf-8'));
    const gnData = JSON.parse(fs.readFileSync(path.join(dataDir, 'gn_divisions.json'), 'utf-8'));
    const villagesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'villages.json'), 'utf-8'));

    // 1. Seed Provinces
    const provinceIdMap = new Map<string, number>();
    for (const p of provincesData) {
      const existing = await db.get('SELECT id FROM provinces WHERE code = ?', [p.code]);
      let provId: number;
      if (!existing) {
        const res = await db.run(
          `INSERT INTO provinces (code, name_en, name_si, name_ta, capital_en, capital_si, capital_ta, latitude, longitude, area_sq_km)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.code, p.name_en, p.name_si, p.name_ta, p.capital_en, p.capital_si, p.capital_ta, p.latitude, p.longitude, p.area_sq_km]
        );
        provId = Number(res.lastInsertRowid);
      } else {
        provId = existing.id;
      }
      provinceIdMap.set(p.code, provId);
    }
    console.log(`Seeded ${provinceIdMap.size} Provinces.`);

    // 2. Seed Districts
    const districtIdMap = new Map<string, number>();
    for (const d of districtsData) {
      const provId = provinceIdMap.get(d.province_code);
      if (!provId) continue;
      const existing = await db.get('SELECT id FROM districts WHERE code = ?', [d.code]);
      let distId: number;
      if (!existing) {
        const res = await db.run(
          `INSERT INTO districts (code, province_id, name_en, name_si, name_ta, capital_en, capital_si, capital_ta, latitude, longitude, area_sq_km)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [d.code, provId, d.name_en, d.name_si, d.name_ta, d.capital_en, d.capital_si, d.capital_ta, d.latitude, d.longitude, d.area_sq_km]
        );
        distId = Number(res.lastInsertRowid);
      } else {
        distId = existing.id;
      }
      districtIdMap.set(d.code, distId);
    }
    console.log(`Seeded ${districtIdMap.size} Districts.`);

    // 3. Seed DS Divisions
    const dsIdMap = new Map<string, number>();
    for (const ds of dsData) {
      const distId = districtIdMap.get(ds.district_code);
      if (!distId) continue;
      const existing = await db.get('SELECT id FROM ds_divisions WHERE code = ?', [ds.code]);
      let dsId: number;
      if (!existing) {
        const res = await db.run(
          `INSERT INTO ds_divisions (code, district_id, name_en, name_si, name_ta, latitude, longitude)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [ds.code, distId, ds.name_en, ds.name_si, ds.name_ta, ds.latitude, ds.longitude]
        );
        dsId = Number(res.lastInsertRowid);
      } else {
        dsId = existing.id;
      }
      dsIdMap.set(ds.code, dsId);
    }
    console.log(`Seeded ${dsIdMap.size} DS Divisions.`);

    // 4. Seed GN Divisions
    const gnIdMap = new Map<string, number>();
    for (const gn of gnData) {
      const dsId = dsIdMap.get(gn.ds_code);
      if (!dsId) continue;
      const existing = await db.get('SELECT id FROM gn_divisions WHERE ds_division_id = ? AND gn_code = ?', [dsId, gn.gn_code]);
      let gnId: number;
      if (!existing) {
        const res = await db.run(
          `INSERT INTO gn_divisions (gn_code, ds_division_id, name_en, name_si, name_ta, latitude, longitude)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [gn.gn_code, dsId, gn.name_en, gn.name_si, gn.name_ta, gn.latitude, gn.longitude]
        );
        gnId = Number(res.lastInsertRowid);
      } else {
        gnId = existing.id;
      }
      gnIdMap.set(gn.gn_code, gnId);
    }
    console.log(`Seeded ${gnIdMap.size} GN Divisions.`);

    // 5. Seed Villages
    let villageCount = 0;
    for (const v of villagesData) {
      const gnId = gnIdMap.get(v.gn_code);
      if (!gnId) continue;
      const existing = await db.get('SELECT id FROM villages WHERE gn_division_id = ? AND name_en = ?', [gnId, v.name_en]);
      let villageId: number;
      if (!existing) {
        const res = await db.run(
          `INSERT INTO villages (gn_division_id, name_en, name_si, name_ta, postal_code, latitude, longitude, is_verified, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [gnId, v.name_en, v.name_si, v.name_ta, v.postal_code || null, v.latitude, v.longitude, v.is_verified ? 1 : 0, v.notes || null]
        );
        villageId = Number(res.lastInsertRowid);
        villageCount++;

        // Add to search names table
        await db.run('INSERT INTO village_names (village_id, name, language, is_primary) VALUES (?, ?, ?, ?)', [villageId, v.name_en, 'en', 1]);
        await db.run('INSERT INTO village_names (village_id, name, language, is_primary) VALUES (?, ?, ?, ?)', [villageId, v.name_si, 'si', 0]);
        await db.run('INSERT INTO village_names (village_id, name, language, is_primary) VALUES (?, ?, ?, ?)', [villageId, v.name_ta, 'ta', 0]);
      }
    }
    console.log(`Seeded ${villageCount} Villages and search indexes.`);
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
