import { Request, Response } from 'express';
import { db } from '../db/index.js';

export async function getVillageById(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid village ID' });
      return;
    }

    const sql = `
      SELECT 
        v.id as village_id,
        v.name_en as village_name_en,
        v.name_si as village_name_si,
        v.name_ta as village_name_ta,
        v.postal_code,
        v.latitude as village_latitude,
        v.longitude as village_longitude,
        v.is_verified,
        v.notes,
        gn.id as gn_id,
        gn.gn_code,
        gn.name_en as gn_name_en,
        gn.name_si as gn_name_si,
        gn.name_ta as gn_name_ta,
        gn.latitude as gn_latitude,
        gn.longitude as gn_longitude,
        ds.id as ds_id,
        ds.code as ds_code,
        ds.name_en as ds_name_en,
        ds.name_si as ds_name_si,
        ds.name_ta as ds_name_ta,
        d.id as district_id,
        d.code as district_code,
        d.name_en as district_name_en,
        d.name_si as district_name_si,
        d.name_ta as district_name_ta,
        p.id as province_id,
        p.code as province_code,
        p.name_en as province_name_en,
        p.name_si as province_name_si,
        p.name_ta as province_name_ta,
        'Sri Lanka' as country_name_en,
        'ශ්‍රී ලංකාව' as country_name_si,
        'இலங்கை' as country_name_ta
      FROM villages v
      JOIN gn_divisions gn ON v.gn_division_id = gn.id
      JOIN ds_divisions ds ON gn.ds_division_id = ds.id
      JOIN districts d ON ds.district_id = d.id
      JOIN provinces p ON d.province_id = p.id
      WHERE v.id = ?
    `;

    const r = await db.get(sql, [id]);
    if (!r) {
      res.status(404).json({ error: 'Village not found' });
      return;
    }

    // Find nearby or sibling villages in the same DS division
    const siblingVillages = await db.query(
      `SELECT v.id, v.name_en, v.name_si, v.name_ta, gn.name_en as gn_name_en, gn.gn_code
       FROM villages v
       JOIN gn_divisions gn ON v.gn_division_id = gn.id
       WHERE gn.ds_division_id = ? AND v.id != ?
       LIMIT 6`,
      [r.ds_id, id]
    );

    // Also check if there are other villages with the identical name in other districts!
    const identicalVillages = await db.query(
      `SELECT 
        v.id, v.name_en, v.name_si, v.name_ta,
        d.name_en as district_name_en,
        p.name_en as province_name_en,
        ds.name_en as ds_name_en
       FROM villages v
       JOIN gn_divisions gn ON v.gn_division_id = gn.id
       JOIN ds_divisions ds ON gn.ds_division_id = ds.id
       JOIN districts d ON ds.district_id = d.id
       JOIN provinces p ON d.province_id = p.id
       WHERE (LOWER(v.name_en) = LOWER(?) OR v.name_si = ?) AND v.id != ?`,
      [r.village_name_en, r.village_name_si, id]
    );

    res.json({
      village: {
        id: r.village_id,
        name_en: r.village_name_en,
        name_si: r.village_name_si,
        name_ta: r.village_name_ta,
        postal_code: r.postal_code,
        latitude: r.village_latitude || r.gn_latitude,
        longitude: r.village_longitude || r.gn_longitude,
        is_verified: Boolean(r.is_verified),
        notes: r.notes,
      },
      gn_division: {
        id: r.gn_id,
        gn_code: r.gn_code,
        name_en: r.gn_name_en,
        name_si: r.gn_name_si,
        name_ta: r.gn_name_ta,
      },
      ds_division: {
        id: r.ds_id,
        code: r.ds_code,
        name_en: r.ds_name_en,
        name_si: r.ds_name_si,
        name_ta: r.ds_name_ta,
      },
      district: {
        id: r.district_id,
        code: r.district_code,
        name_en: r.district_name_en,
        name_si: r.district_name_si,
        name_ta: r.district_name_ta,
      },
      province: {
        id: r.province_id,
        code: r.province_code,
        name_en: r.province_name_en,
        name_si: r.province_name_si,
        name_ta: r.province_name_ta,
      },
      country: {
        name_en: r.country_name_en,
        name_si: r.country_name_si,
        name_ta: r.country_name_ta,
      },
      coordinates: {
        latitude: r.village_latitude || r.gn_latitude,
        longitude: r.village_longitude || r.gn_longitude,
        has_coordinates: Boolean(r.village_latitude || r.gn_latitude),
      },
      breadcrumb: [
        { label: 'Home', path: '/' },
        { label: r.province_name_en, path: `/provinces/${r.province_code}` },
        { label: `${r.district_name_en} District`, path: `/districts/${r.district_code}` },
        { label: `${r.ds_name_en} DS`, path: `/ds-divisions/${r.ds_id}` },
        { label: r.village_name_en, path: `/locations/${r.village_id}`, current: true },
      ],
      sibling_villages: siblingVillages,
      identical_name_villages: identicalVillages,
    });
  } catch (err: any) {
    console.error('Error fetching village:', err);
    res.status(500).json({ error: 'Failed to fetch village details', details: err.message });
  }
}

export async function getAllProvinces(req: Request, res: Response): Promise<void> {
  try {
    const sql = `
      SELECT 
        p.*,
        COUNT(DISTINCT d.id) as district_count,
        COUNT(DISTINCT ds.id) as ds_count,
        COUNT(DISTINCT gn.id) as gn_count,
        COUNT(DISTINCT v.id) as village_count
      FROM provinces p
      LEFT JOIN districts d ON d.province_id = p.id
      LEFT JOIN ds_divisions ds ON ds.district_id = d.id
      LEFT JOIN gn_divisions gn ON gn.ds_division_id = ds.id
      LEFT JOIN villages v ON v.gn_division_id = gn.id
      GROUP BY p.id
      ORDER BY p.id ASC
    `;
    const rows = await db.query(sql);
    res.json({ provinces: rows });
  } catch (err: any) {
    console.error('Error fetching provinces:', err);
    res.status(500).json({ error: 'Failed to fetch provinces', details: err.message });
  }
}

export async function getProvinceDetail(req: Request, res: Response): Promise<void> {
  try {
    const { codeOrId } = req.params;
    const isNum = !isNaN(Number(codeOrId));

    const province = await db.get(
      isNum ? 'SELECT * FROM provinces WHERE id = ?' : 'SELECT * FROM provinces WHERE LOWER(code) = LOWER(?)',
      [codeOrId]
    );

    if (!province) {
      res.status(404).json({ error: 'Province not found' });
      return;
    }

    const districts = await db.query(
      `SELECT d.*, 
        COUNT(DISTINCT ds.id) as ds_count,
        COUNT(DISTINCT v.id) as village_count
       FROM districts d
       LEFT JOIN ds_divisions ds ON ds.district_id = d.id
       LEFT JOIN gn_divisions gn ON gn.ds_division_id = ds.id
       LEFT JOIN villages v ON v.gn_division_id = gn.id
       WHERE d.province_id = ?
       GROUP BY d.id
       ORDER BY d.name_en ASC`,
      [province.id]
    );

    res.json({ province, districts });
  } catch (err: any) {
    console.error('Error fetching province detail:', err);
    res.status(500).json({ error: 'Failed to fetch province detail', details: err.message });
  }
}

export async function getAllDistricts(req: Request, res: Response): Promise<void> {
  try {
    const provinceId = req.query.province_id ? Number(req.query.province_id) : undefined;
    const search = req.query.search ? `%${(req.query.search as string).toLowerCase()}%` : undefined;

    let sql = `
      SELECT 
        d.*,
        p.code as province_code,
        p.name_en as province_name_en,
        p.name_si as province_name_si,
        p.name_ta as province_name_ta,
        COUNT(DISTINCT ds.id) as ds_count,
        COUNT(DISTINCT gn.id) as gn_count,
        COUNT(DISTINCT v.id) as village_count
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
      LEFT JOIN ds_divisions ds ON ds.district_id = d.id
      LEFT JOIN gn_divisions gn ON gn.ds_division_id = ds.id
      LEFT JOIN villages v ON v.gn_division_id = gn.id
    `;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (provinceId) {
      whereClauses.push('d.province_id = ?');
      params.push(provinceId);
    }
    if (search) {
      whereClauses.push('(LOWER(d.name_en) LIKE ? OR d.name_si LIKE ? OR d.name_ta LIKE ?)');
      params.push(search, `%${req.query.search}%`, `%${req.query.search}%`);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' GROUP BY d.id ORDER BY d.name_en ASC';

    const rows = await db.query(sql, params);
    res.json({ districts: rows });
  } catch (err: any) {
    console.error('Error fetching districts:', err);
    res.status(500).json({ error: 'Failed to fetch districts', details: err.message });
  }
}

export async function getDistrictDetail(req: Request, res: Response): Promise<void> {
  try {
    const { codeOrId } = req.params;
    const isNum = !isNaN(Number(codeOrId));

    const district = await db.get(
      `SELECT d.*, p.name_en as province_name_en, p.code as province_code
       FROM districts d
       JOIN provinces p ON d.province_id = p.id
       WHERE ${isNum ? 'd.id = ?' : 'LOWER(d.code) = LOWER(?)'}`,
      [codeOrId]
    );

    if (!district) {
      res.status(404).json({ error: 'District not found' });
      return;
    }

    const dsDivisions = await db.query(
      `SELECT ds.*, 
        COUNT(DISTINCT gn.id) as gn_count,
        COUNT(DISTINCT v.id) as village_count
       FROM ds_divisions ds
       LEFT JOIN gn_divisions gn ON gn.ds_division_id = ds.id
       LEFT JOIN villages v ON v.gn_division_id = gn.id
       WHERE ds.district_id = ?
       GROUP BY ds.id
       ORDER BY ds.name_en ASC`,
      [district.id]
    );

    res.json({ district, ds_divisions: dsDivisions });
  } catch (err: any) {
    console.error('Error fetching district detail:', err);
    res.status(500).json({ error: 'Failed to fetch district detail', details: err.message });
  }
}

export async function getDSDivisionDetail(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const ds = await db.get(
      `SELECT ds.*, d.name_en as district_name_en, d.code as district_code,
              p.name_en as province_name_en, p.code as province_code
       FROM ds_divisions ds
       JOIN districts d ON ds.district_id = d.id
       JOIN provinces p ON d.province_id = p.id
       WHERE ds.id = ?`,
      [id]
    );

    if (!ds) {
      res.status(404).json({ error: 'DS Division not found' });
      return;
    }

    const gnDivisions = await db.query(
      `SELECT gn.*, COUNT(v.id) as village_count
       FROM gn_divisions gn
       LEFT JOIN villages v ON v.gn_division_id = gn.id
       WHERE gn.ds_division_id = ?
       GROUP BY gn.id
       ORDER BY gn.gn_code ASC`,
      [id]
    );

    res.json({ ds_division: ds, gn_divisions: gnDivisions });
  } catch (err: any) {
    console.error('Error fetching DS division:', err);
    res.status(500).json({ error: 'Failed to fetch DS division', details: err.message });
  }
}

export async function getMapLocations(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || '200', 10), 500);

    const sql = `
      SELECT 
        v.id as village_id,
        v.name_en,
        v.name_si,
        v.name_ta,
        v.latitude,
        v.longitude,
        v.is_verified,
        gn.name_en as gn_name_en,
        gn.gn_code,
        ds.name_en as ds_name_en,
        d.name_en as district_name_en,
        p.name_en as province_name_en
      FROM villages v
      JOIN gn_divisions gn ON v.gn_division_id = gn.id
      JOIN ds_divisions ds ON gn.ds_division_id = ds.id
      JOIN districts d ON ds.district_id = d.id
      JOIN provinces p ON d.province_id = p.id
      WHERE v.latitude IS NOT NULL AND v.longitude IS NOT NULL
      LIMIT ?
    `;

    const locations = await db.query(sql, [limit]);
    res.json({ count: locations.length, locations });
  } catch (err: any) {
    console.error('Error fetching map locations:', err);
    res.status(500).json({ error: 'Failed to fetch map locations', details: err.message });
  }
}
