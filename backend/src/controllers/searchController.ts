import { Request, Response } from 'express';
import { db } from '../db/index.js';

export async function searchLocations(req: Request, res: Response): Promise<void> {
  try {
    const query = ((req.query.q as string) || '').trim();
    const provinceId = req.query.province_id ? Number(req.query.province_id) : undefined;
    const districtId = req.query.district_id ? Number(req.query.district_id) : undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);
    const offset = Math.max(parseInt((req.query.offset as string) || '0', 10), 0);

    if (!query) {
      res.json({
        query: '',
        total: 0,
        results: [],
        message: 'Please provide a search term (village, GN division, or locality name).'
      });
      return;
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    const exactTerm = query.toLowerCase();

    // SQL query joining Village -> GN -> DS -> District -> Province
    // Multiple villages with identical names will return multiple distinct rows with their own administrative hierarchy!
    let sql = `
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
      WHERE (
        LOWER(v.name_en) LIKE ? OR
        v.name_si LIKE ? OR
        v.name_ta LIKE ? OR
        LOWER(gn.name_en) LIKE ? OR
        gn.name_si LIKE ? OR
        gn.name_ta LIKE ? OR
        gn.gn_code LIKE ? OR
        LOWER(ds.name_en) LIKE ? OR
        ds.name_si LIKE ? OR
        ds.name_ta LIKE ? OR
        LOWER(d.name_en) LIKE ? OR
        d.name_si LIKE ? OR
        d.name_ta LIKE ?
      )
    `;

    const params: any[] = [
      searchTerm, `%${query}%`, `%${query}%`,
      searchTerm, `%${query}%`, `%${query}%`,
      searchTerm,
      searchTerm, `%${query}%`, `%${query}%`,
      searchTerm, `%${query}%`, `%${query}%`,
    ];

    if (provinceId) {
      sql += ' AND p.id = ?';
      params.push(provinceId);
    }
    if (districtId) {
      sql += ' AND d.id = ?';
      params.push(districtId);
    }

    // Sort order: exact village match first, then starting with query, then alphabetical
    sql += `
      ORDER BY 
        CASE 
          WHEN LOWER(v.name_en) = ? OR v.name_si = ? OR v.name_ta = ? THEN 1
          WHEN LOWER(v.name_en) LIKE ? THEN 2
          WHEN LOWER(gn.name_en) = ? THEN 3
          ELSE 4
        END,
        v.name_en ASC
      LIMIT ? OFFSET ?
    `;

    params.push(exactTerm, query, query, `${exactTerm}%`, exactTerm, limit, offset);

    const rows = await db.query(sql, params);

    // Format results to structured object
    const results = rows.map((r: any) => ({
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
      }
    }));

    res.json({
      query,
      count: results.length,
      results,
      message: results.length === 0 ? `No administrative locations found matching "${query}". Check your spelling or try another language.` : undefined
    });
  } catch (err: any) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
}

export async function getSearchSuggestions(req: Request, res: Response): Promise<void> {
  try {
    const query = ((req.query.q as string) || '').trim();
    if (!query || query.length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    const startTerm = `${query.toLowerCase()}%`;

    // Fast suggestion query across villages, GN divisions, and DS divisions
    const sql = `
      SELECT 
        v.id,
        v.name_en,
        v.name_si,
        v.name_ta,
        'village' as type,
        d.name_en as district_name_en,
        p.name_en as province_name_en,
        gn.name_en as gn_name_en,
        ds.name_en as ds_name_en
      FROM villages v
      JOIN gn_divisions gn ON v.gn_division_id = gn.id
      JOIN ds_divisions ds ON gn.ds_division_id = ds.id
      JOIN districts d ON ds.district_id = d.id
      JOIN provinces p ON d.province_id = p.id
      WHERE LOWER(v.name_en) LIKE ? OR v.name_si LIKE ? OR v.name_ta LIKE ?
      ORDER BY 
        CASE WHEN LOWER(v.name_en) LIKE ? THEN 1 ELSE 2 END,
        v.name_en ASC
      LIMIT 8
    `;

    const rows = await db.query(sql, [searchTerm, `%${query}%`, `%${query}%`, startTerm]);

    const suggestions = rows.map((r: any) => ({
      id: r.id,
      title_en: r.name_en,
      title_si: r.name_si,
      title_ta: r.name_ta,
      type: r.type,
      subtitle: `${r.ds_name_en} DS, ${r.district_name_en} District, ${r.province_name_en}`,
      subtitle_compact: `${r.district_name_en}, ${r.province_name_en}`
    }));

    res.json({ suggestions });
  } catch (err: any) {
    console.error('Suggestion error:', err);
    res.status(500).json({ error: 'Failed to retrieve suggestions', details: err.message });
  }
}
