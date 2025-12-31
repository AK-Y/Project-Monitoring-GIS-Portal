const db = require("./src/config/db");

async function dump() {
  const query = `
      SELECT 
        a.id::text, 
        a.asset_code::text, 
        a.asset_type::text, 
        CASE 
          WHEN a.geom IS NOT NULL THEN ST_AsGeoJSON(a.geom)
          ELSE (
            SELECT ST_AsGeoJSON(ST_MakeLine(
              ST_SetSRID(ST_MakePoint(pa.start_longitude, pa.start_latitude), 4326), 
              ST_SetSRID(ST_MakePoint(pa.end_longitude, pa.end_latitude), 4326)
            ))
            FROM project_assets pa 
            WHERE pa.asset_id::text = a.id::text
            AND pa.start_latitude IS NOT NULL 
            AND pa.start_longitude IS NOT NULL
            AND (pa.start_latitude != pa.end_latitude OR pa.start_longitude != pa.end_longitude)
            LIMIT 1
          )
        END::text as geometry
      FROM assets a
      UNION ALL
      SELECT 
        pa.asset_id::text as id,
        ('NEW-' || pa.asset_id::text)::text as asset_code,
        (CASE 
          WHEN pa.type_of_road ILIKE '%Drain%' THEN 'Drain'
          WHEN pa.type_of_road ILIKE '%Sewer%' THEN 'Sewer'
          ELSE 'Road'
        END)::text as asset_type,
        ST_AsGeoJSON(ST_MakeLine(
          ST_SetSRID(ST_MakePoint(pa.start_longitude, pa.start_latitude), 4326), 
          ST_SetSRID(ST_MakePoint(pa.end_longitude, pa.end_latitude), 4326)
        ))::text as geometry
      FROM project_assets pa
      WHERE pa.start_latitude IS NOT NULL 
      AND pa.start_longitude IS NOT NULL 
      AND pa.end_latitude IS NOT NULL 
      AND pa.end_longitude IS NOT NULL
      AND (pa.start_latitude != pa.end_latitude OR pa.start_longitude != pa.end_longitude)
      AND pa.asset_id::text NOT IN (SELECT id::text FROM assets)
    `;
  try {
    const { rows } = await db.query(query);
    rows.forEach(r => {
        if (r.geometry) {
            const geo = JSON.parse(r.geometry);
            console.log(`ASSET: ${r.asset_code} | TYPE: ${r.asset_type} | COORDS: ${JSON.stringify(geo.coordinates)}`);
        } else {
            console.log(`ASSET: ${r.asset_code} | NO DATA`);
        }
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
dump();
