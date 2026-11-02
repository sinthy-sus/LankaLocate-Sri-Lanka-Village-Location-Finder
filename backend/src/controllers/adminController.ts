import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parse } from 'csv-parse/sync';
import { db } from '../db/index.js';
import { config } from '../config/index.js';
import { AuthRequest } from '../middleware/auth.js';

export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const user = await db.get(
      'SELECT * FROM admin_users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Update last login
    await db.run('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.user, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
}

export async function getAdminProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const user = await db.get('SELECT id, username, email, role, created_at, last_login FROM admin_users WHERE id = ?', [req.user.id]);
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin profile', details: err.message });
  }
}

export async function getAdminStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const provCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM provinces');
    const distCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM districts');
    const dsCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM ds_divisions');
    const gnCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM gn_divisions');
    const villageCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM villages');
    const verifiedCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM villages WHERE is_verified = 1');
    const unverifiedCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM villages WHERE is_verified = 0');
    const missingCoords = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM villages WHERE latitude IS NULL OR longitude IS NULL');

    // Duplicate village names report
    const duplicateNames = await db.query(`
      SELECT LOWER(name_en) as name_en, COUNT(*) as duplicate_count,
             GROUP_CONCAT(name_si, ' / ') as sinhala_names
      FROM villages
      GROUP BY LOWER(name_en)
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC
    `);

    res.json({
      overview: {
        provinces: Number(provCount?.count || 0),
        districts: Number(distCount?.count || 0),
        ds_divisions: Number(dsCount?.count || 0),
        gn_divisions: Number(gnCount?.count || 0),
        villages: Number(villageCount?.count || 0),
        verified_villages: Number(verifiedCount?.count || 0),
        unverified_villages: Number(unverifiedCount?.count || 0),
        missing_coordinates: Number(missingCoords?.count || 0),
      },
      duplicate_village_names: duplicateNames,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin stats', details: err.message });
  }
}

// Manage Villages CRUD
export async function getAdminVillages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${(req.query.search as string).toLowerCase()}%` : undefined;
    const districtId = req.query.district_id ? Number(req.query.district_id) : undefined;

    let sql = `
      SELECT 
        v.*,
        gn.gn_code,
        gn.name_en as gn_name_en,
        ds.name_en as ds_name_en,
        d.name_en as district_name_en,
        p.name_en as province_name_en
      FROM villages v
      JOIN gn_divisions gn ON v.gn_division_id = gn.id
      JOIN ds_divisions ds ON gn.ds_division_id = ds.id
      JOIN districts d ON ds.district_id = d.id
      JOIN provinces p ON d.province_id = p.id
    `;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (search) {
      whereClauses.push('(LOWER(v.name_en) LIKE ? OR v.name_si LIKE ? OR v.name_ta LIKE ?)');
      params.push(search, `%${req.query.search}%`, `%${req.query.search}%`);
    }
    if (districtId) {
      whereClauses.push('d.id = ?');
      params.push(districtId);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' ORDER BY v.id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await db.query(sql, params);

    const countRes = await db.get<{ total: number }>('SELECT COUNT(*) as total FROM villages');

    res.json({
      data: rows,
      page,
      limit,
      total: Number(countRes?.total || 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch villages', details: err.message });
  }
}

export async function createVillage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { gn_division_id, name_en, name_si, name_ta, postal_code, latitude, longitude, is_verified, notes } = req.body;

    if (!gn_division_id || !name_en || !name_si || !name_ta) {
      res.status(400).json({ error: 'GN division and multilingual names (EN, SI, TA) are required' });
      return;
    }

    // Verify GN division exists
    const gn = await db.get('SELECT id FROM gn_divisions WHERE id = ?', [gn_division_id]);
    if (!gn) {
      res.status(400).json({ error: 'Specified GN division does not exist' });
      return;
    }

    const result = await db.run(
      `INSERT INTO villages (gn_division_id, name_en, name_si, name_ta, postal_code, latitude, longitude, is_verified, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [gn_division_id, name_en, name_si, name_ta, postal_code || null, latitude || null, longitude || null, is_verified ? 1 : 0, notes || null]
    );

    const newId = Number(result.lastInsertRowid);

    // Add search index
    await db.run('INSERT INTO village_names (village_id, name, language, is_primary) VALUES (?, ?, ?, ?)', [newId, name_en, 'en', 1]);
    await db.run('INSERT INTO village_names (village_id, name, language, is_primary) VALUES (?, ?, ?, ?)', [newId, name_si, 'si', 0]);
    await db.run('INSERT INTO village_names (village_id, name, language, is_primary) VALUES (?, ?, ?, ?)', [newId, name_ta, 'ta', 0]);

    res.status(201).json({ id: newId, message: 'Village created successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create village', details: err.message });
  }
}

export async function updateVillage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { gn_division_id, name_en, name_si, name_ta, postal_code, latitude, longitude, is_verified, notes } = req.body;

    const existing = await db.get('SELECT id FROM villages WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Village not found' });
      return;
    }

    await db.run(
      `UPDATE villages 
       SET gn_division_id = COALESCE(?, gn_division_id),
           name_en = COALESCE(?, name_en),
           name_si = COALESCE(?, name_si),
           name_ta = COALESCE(?, name_ta),
           postal_code = ?,
           latitude = ?,
           longitude = ?,
           is_verified = COALESCE(?, is_verified),
           notes = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [gn_division_id, name_en, name_si, name_ta, postal_code, latitude, longitude, is_verified, notes, id]
    );

    res.json({ message: 'Village updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update village', details: err.message });
  }
}

export async function deleteVillage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    await db.run('DELETE FROM villages WHERE id = ?', [id]);
    res.json({ message: 'Village deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete village', details: err.message });
  }
}

// CSV Data Import
export async function importCsvData(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No CSV file uploaded' });
      return;
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const gnCode = row.gn_code || row.gn_division_code;
      const nameEn = row.name_en || row.village_name_en;
      const nameSi = row.name_si || row.village_name_si || nameEn;
      const nameTa = row.name_ta || row.village_name_ta || nameEn;
      const postalCode = row.postal_code || null;
      const lat = row.latitude ? parseFloat(row.latitude) : null;
      const lng = row.longitude ? parseFloat(row.longitude) : null;
      const isVerified = row.is_verified === 'true' || row.is_verified === '1' ? 1 : 0;
      const notes = row.notes || null;

      if (!gnCode || !nameEn) {
        skipped++;
        errors.push(`Row ${i + 1}: Missing gn_code or name_en`);
        continue;
      }

      // Find GN division
      const gn = await db.get('SELECT id FROM gn_divisions WHERE gn_code = ?', [gnCode]);
      if (!gn) {
        skipped++;
        errors.push(`Row ${i + 1}: GN division with code "${gnCode}" not found`);
        continue;
      }

      // Check if identical village already in that GN division
      const existing = await db.get('SELECT id FROM villages WHERE gn_division_id = ? AND LOWER(name_en) = LOWER(?)', [gn.id, nameEn]);
      if (existing) {
        skipped++;
        continue;
      }

      const result = await db.run(
        `INSERT INTO villages (gn_division_id, name_en, name_si, name_ta, postal_code, latitude, longitude, is_verified, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [gn.id, nameEn, nameSi, nameTa, postalCode, lat, lng, isVerified, notes]
      );

      const villageId = Number(result.lastInsertRowid);
      await db.run('INSERT INTO village_names (village_id, name, language, is_primary) VALUES (?, ?, ?, ?)', [villageId, nameEn, 'en', 1]);
      await db.run('INSERT INTO village_names (village_id, name, language, is_primary) VALUES (?, ?, ?, ?)', [villageId, nameSi, 'si', 0]);
      await db.run('INSERT INTO village_names (village_id, name, language, is_primary) VALUES (?, ?, ?, ?)', [villageId, nameTa, 'ta', 0]);

      imported++;
    }

    res.json({
      message: `CSV Import completed: ${imported} imported, ${skipped} skipped`,
      imported,
      skipped,
      errors: errors.slice(0, 10),
    });
  } catch (err: any) {
    console.error('CSV import error:', err);
    res.status(500).json({ error: 'Failed to process CSV file', details: err.message });
  }
}

// CSV Data Export
export async function exportCsvData(req: Request, res: Response): Promise<void> {
  try {
    const rows = await db.query(`
      SELECT 
        v.id as village_id,
        v.name_en as village_name_en,
        v.name_si as village_name_si,
        v.name_ta as village_name_ta,
        v.postal_code,
        v.latitude,
        v.longitude,
        v.is_verified,
        gn.gn_code,
        gn.name_en as gn_name_en,
        ds.code as ds_code,
        ds.name_en as ds_name_en,
        d.code as district_code,
        d.name_en as district_name_en,
        p.code as province_code,
        p.name_en as province_name_en
      FROM villages v
      JOIN gn_divisions gn ON v.gn_division_id = gn.id
      JOIN ds_divisions ds ON gn.ds_division_id = ds.id
      JOIN districts d ON ds.district_id = d.id
      JOIN provinces p ON d.province_id = p.id
      ORDER BY p.id, d.id, ds.id, v.id
    `);

    // Build CSV
    const headers = [
      'village_id', 'village_name_en', 'village_name_si', 'village_name_ta',
      'postal_code', 'latitude', 'longitude', 'is_verified',
      'gn_code', 'gn_name_en', 'ds_code', 'ds_name_en',
      'district_code', 'district_name_en', 'province_code', 'province_name_en'
    ];

    const csvLines = [headers.join(',')];
    for (const r of rows) {
      const line = [
        r.village_id,
        `"${(r.village_name_en || '').replace(/"/g, '""')}"`,
        `"${(r.village_name_si || '').replace(/"/g, '""')}"`,
        `"${(r.village_name_ta || '').replace(/"/g, '""')}"`,
        r.postal_code || '',
        r.latitude || '',
        r.longitude || '',
        r.is_verified,
        r.gn_code,
        `"${(r.gn_name_en || '').replace(/"/g, '""')}"`,
        r.ds_code,
        `"${(r.ds_name_en || '').replace(/"/g, '""')}"`,
        r.district_code,
        `"${(r.district_name_en || '').replace(/"/g, '""')}"`,
        r.province_code,
        `"${(r.province_name_en || '').replace(/"/g, '""')}"`
      ];
      csvLines.push(line.join(','));
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="lankalocate_verified_villages.csv"');
    res.send('\uFEFF' + csvLines.join('\n')); // Add UTF-8 BOM for Excel
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to export CSV', details: err.message });
  }
}
