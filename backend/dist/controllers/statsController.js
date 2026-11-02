import { db } from '../db/index.js';
export async function getPlatformStats(req, res) {
    try {
        const provCount = await db.get('SELECT COUNT(*) as count FROM provinces');
        const distCount = await db.get('SELECT COUNT(*) as count FROM districts');
        const dsCount = await db.get('SELECT COUNT(*) as count FROM ds_divisions');
        const gnCount = await db.get('SELECT COUNT(*) as count FROM gn_divisions');
        const villageCount = await db.get('SELECT COUNT(*) as count FROM villages');
        const verifiedVillageCount = await db.get('SELECT COUNT(*) as count FROM villages WHERE is_verified = 1');
        // Popular districts with highlights
        const popularDistricts = await db.query(`
      SELECT 
        d.id, d.code, d.name_en, d.name_si, d.name_ta,
        p.name_en as province_name_en,
        COUNT(DISTINCT ds.id) as ds_count,
        COUNT(DISTINCT v.id) as village_count
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
      LEFT JOIN ds_divisions ds ON ds.district_id = d.id
      LEFT JOIN gn_divisions gn ON gn.ds_division_id = ds.id
      LEFT JOIN villages v ON v.gn_division_id = gn.id
      WHERE d.code IN ('COL', 'GAM', 'KAN', 'GAL', 'JAF', 'BAD')
      GROUP BY d.id
      ORDER BY village_count DESC
    `);
        res.json({
            provinces: Number(provCount?.count || 9),
            districts: Number(distCount?.count || 25),
            ds_divisions: Number(dsCount?.count || 0),
            gn_divisions: Number(gnCount?.count || 0),
            villages: Number(villageCount?.count || 0),
            verified_villages: Number(verifiedVillageCount?.count || 0),
            popular_districts: popularDistricts,
            country: {
                name_en: 'Sri Lanka',
                name_si: 'ශ්‍රී ලංකාව',
                name_ta: 'இலங்கை',
                code: 'LK',
                capital: 'Sri Jayawardenepura Kotte',
                commercial_capital: 'Colombo',
            }
        });
    }
    catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch platform statistics', details: err.message });
    }
}
