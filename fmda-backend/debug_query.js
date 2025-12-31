const db = require("./src/config/db");

async function check() {
  const query = `
      WITH latest_project_assets AS (
        SELECT DISTINCT ON (asset_id) *
        FROM project_assets
        ORDER BY asset_id, created_at DESC
      )
      SELECT 
        a.id::text, 
        TRIM(a.asset_code)::text as asset_code, 
        CASE 
          WHEN a.asset_type ILIKE '%Road%' THEN 'Road'
          WHEN a.asset_type ILIKE '%Drain%' THEN 'Drain'
          WHEN a.asset_type ILIKE '%Sewer%' THEN 'Sewer'
          ELSE 'Road'
        END::text as asset_type,
        a.length::text, 
        a.ward::text,
        COALESCE(pa.road_taken_over_from, '')::text as road_taken_over_from,
        pa.year_of_taken_over::text,
        pa.history_of_road::text,
        pa.start_point::text as start_point,
        pa.start_latitude,
        pa.start_longitude,
        pa.end_point::text as end_point,
        pa.end_latitude,
        pa.end_longitude,
        pa.width_of_carriage_way::text,
        pa.width_of_central_verge::text,
        pa.width_of_footpath::text,
        pa.lhs_green_belt::text,
        pa.rhs_green_belt::text,
        pa.street_lights::text,
        pa.row_width::text,
        pa.type_of_road::text,
        pa.paved_portion_lhs::text,
        pa.paved_portion_rhs::text,
        pa.cross_section_of_road::text,
        pa.storm_water_drain_lhs::text,
        pa.storm_water_drain_rhs::text,
        CASE 
          WHEN a.geom IS NOT NULL THEN ST_AsGeoJSON(a.geom)
          ELSE (
            SELECT ST_AsGeoJSON(ST_MakeLine(
              ST_SetSRID(ST_MakePoint(pa2.start_longitude, pa2.start_latitude), 4326), 
              ST_SetSRID(ST_MakePoint(pa2.end_longitude, pa2.end_latitude), 4326)
            ))
            FROM project_assets pa2 
            WHERE pa2.asset_id::text = a.id::text
            AND pa2.start_latitude IS NOT NULL 
            AND pa2.start_longitude IS NOT NULL
            AND (pa2.start_latitude != pa2.end_latitude OR pa2.start_longitude != pa2.end_longitude)
            LIMIT 1
          )
        END::text as geometry,
        (SELECT COUNT(*) FROM project_assets pa3 WHERE pa3.asset_id::text = a.id::text)::bigint as project_count
      FROM assets a
      LEFT JOIN latest_project_assets pa ON a.id::text = pa.asset_id::text
      UNION ALL
      SELECT 
        pa.asset_id::text as id,
        ('NEW-' || TRIM(pa.asset_id::text))::text as asset_code,
        CASE 
          WHEN pa.type_of_road ILIKE '%Drain%' THEN 'Drain'
          WHEN pa.type_of_road ILIKE '%Sewer%' THEN 'Sewer'
          ELSE 'Road'
        END::text as asset_type,
        pa.length::text,
        NULL::text as ward,
        pa.road_taken_over_from::text,
        pa.year_of_taken_over::text,
        pa.history_of_road::text,
        pa.start_point::text,
        pa.start_latitude,
        pa.start_longitude,
        pa.end_point::text,
        pa.end_latitude,
        pa.end_longitude,
        pa.width_of_carriage_way::text,
        pa.width_of_central_verge::text,
        pa.width_of_footpath::text,
        pa.lhs_green_belt::text,
        pa.rhs_green_belt::text,
        pa.street_lights::text,
        pa.row_width::text,
        pa.type_of_road::text,
        pa.paved_portion_lhs::text,
        pa.paved_portion_rhs::text,
        pa.cross_section_of_road::text,
        pa.storm_water_drain_lhs::text,
        pa.storm_water_drain_rhs::text,
        ST_AsGeoJSON(ST_MakeLine(
          ST_SetSRID(ST_MakePoint(pa.start_longitude, pa.start_latitude), 4326), 
          ST_SetSRID(ST_MakePoint(pa.end_longitude, pa.end_latitude), 4326)
        ))::text as geometry,
        1::bigint as project_count
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
    console.log("RESULT_COUNT:" + rows.length);
    console.log("SAMPLE_ROW:" + JSON.stringify(rows[0]));
    process.exit(0);
  } catch (err) {
    console.error("FULL_QUERY_ERROR:", err.message);
    process.exit(1);
  }
}
check();
