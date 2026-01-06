const db = require("../config/db");

exports.getAssets = async (req, res) => {
  try {
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
          WHEN a.type ILIKE '%Road%' OR a.type ILIKE '%Bituminous%' OR a.type ILIKE '%Concrete%' THEN 'Road'
          WHEN a.type ILIKE '%Drain%' THEN 'Drain'
          WHEN a.type ILIKE '%Sewer%' THEN 'Sewer'
          ELSE 'Road'
        END::text as asset_type,
        a.length::text, 
        a.ward::text,
        a.zone::text,
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
        COALESCE(pa.vertices, '[]'::jsonb) as vertices,
        CASE 
          WHEN a.geometry IS NOT NULL THEN ST_AsGeoJSON(a.geometry)
          WHEN pa.vertices IS NOT NULL AND jsonb_typeof(pa.vertices) = 'array' AND jsonb_array_length(pa.vertices) >= 2 THEN (
            SELECT ST_AsGeoJSON(ST_MakeLine(ARRAY(
              SELECT ST_SetSRID(ST_Point((pt->>0)::float8, (pt->>1)::float8), 4326)
              FROM jsonb_array_elements(pa.vertices) pt
            )))
          )
          ELSE (
            SELECT ST_AsGeoJSON(ST_MakeLine(
              ST_SetSRID(ST_Point(pa2.start_longitude, pa2.start_latitude), 4326), 
              ST_SetSRID(ST_Point(pa2.end_longitude, pa2.end_latitude), 4326)
            ))
            FROM project_assets pa2 
            WHERE pa2.asset_id::text = a.id::text
            AND pa2.start_latitude IS NOT NULL 
            AND pa2.start_longitude IS NOT NULL
            AND (pa2.start_latitude != pa2.end_latitude OR pa2.start_longitude != pa2.end_longitude)
            LIMIT 1
          )
        END::text as geometry,
        (
          SELECT COUNT(DISTINCT p_id) FROM (
            SELECT project_id as p_id FROM project_assets WHERE asset_id::text = a.id::text
            UNION
            SELECT project_id as p_id FROM project_asset_links WHERE asset_code = a.asset_code
          ) combined_projects
        )::bigint as project_count,
        false::boolean as is_synthetic,
        false::boolean as is_proposed
      FROM assets a
      LEFT JOIN latest_project_assets pa ON a.id::text = pa.asset_id::text
      
      UNION ALL
      
      SELECT 
        pa.asset_id::text as id,
        TRIM(pa.asset_id::text)::text as asset_code,
        CASE 
          WHEN pa.type_of_road ILIKE '%Road%' OR pa.type_of_road ILIKE '%Bituminous%' OR pa.type_of_road ILIKE '%Concrete%' THEN 'Road'
          WHEN pa.type_of_road ILIKE '%Drain%' THEN 'Drain'
          WHEN pa.type_of_road ILIKE '%Sewer%' THEN 'Sewer'
          ELSE 'Road'
        END::text as asset_type,
        pa.length::text,
        NULL::text as ward,
        NULL::text as zone,
        pa.road_taken_over_from::text,
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
        COALESCE(pa.vertices, '[]'::jsonb) as vertices,
        CASE
          WHEN pa.vertices IS NOT NULL AND jsonb_typeof(pa.vertices) = 'array' AND jsonb_array_length(pa.vertices) >= 2 THEN (
            SELECT ST_AsGeoJSON(ST_MakeLine(ARRAY(
              SELECT ST_SetSRID(ST_Point((pt->>0)::float8, (pt->>1)::float8), 4326)
              FROM jsonb_array_elements(pa.vertices) pt
            )))
          )
          ELSE ST_AsGeoJSON(ST_MakeLine(
            ST_SetSRID(ST_Point(pa.start_longitude, pa.start_latitude), 4326), 
            ST_SetSRID(ST_Point(pa.end_longitude, pa.end_latitude), 4326)
          ))
        END::text as geometry,
        (SELECT COUNT(*) FROM project_assets pa2 WHERE pa2.asset_id::text = pa.asset_id::text)::bigint as project_count,
        true::boolean as is_synthetic,
        false::boolean as is_proposed
      FROM latest_project_assets pa
      WHERE pa.start_latitude IS NOT NULL 
      AND pa.start_longitude IS NOT NULL 
      AND pa.end_latitude IS NOT NULL 
      AND pa.end_longitude IS NOT NULL
      AND (pa.start_latitude != pa.end_latitude OR pa.start_longitude != pa.end_longitude)
      AND pa.asset_id::text NOT IN (SELECT id::text FROM assets)
      
      UNION ALL
      
      SELECT 
        fa.id::text as id,
        'PROPOSED'::text as asset_code,
        'Proposed Work'::text as asset_type,
        'N/A'::text as length,
        NULL::text as ward,
        NULL::text as zone,
        'PROPOSED'::text as road_taken_over_from,
        NULL::text as year_of_taken_over,
        'Proposed under File #' || fa.file_id::text as history_of_road,
        'Proposed'::text as start_point,
        fa.start_latitude,
        fa.start_longitude,
        'Proposed'::text as end_point,
        fa.end_latitude,
        fa.end_longitude,
        NULL::text as width_of_carriage_way,
        NULL::text as width_of_central_verge,
        NULL::text as width_of_footpath,
        NULL::text as lhs_green_belt,
        NULL::text as rhs_green_belt,
        NULL::text as street_lights,
        NULL::text as row_width,
        'Proposed'::text as type_of_road,
        NULL::text as paved_portion_lhs,
        NULL::text as paved_portion_rhs,
        NULL::text as cross_section_of_road,
        NULL::text as storm_water_drain_lhs,
        NULL::text as storm_water_drain_rhs,
        COALESCE(fa.location_data, '[]'::jsonb) as vertices,
        CASE
          WHEN fa.location_data IS NOT NULL AND jsonb_typeof(fa.location_data) = 'array' AND jsonb_array_length(fa.location_data) >= 2 THEN (
            SELECT ST_AsGeoJSON(ST_MakeLine(ARRAY(
              SELECT ST_SetSRID(ST_Point((pt->>0)::float8, (pt->>1)::float8), 4326)
              FROM jsonb_array_elements(fa.location_data) pt
            )))
          )
          ELSE ST_AsGeoJSON(ST_MakeLine(
            ST_SetSRID(ST_Point(fa.start_longitude, fa.start_latitude), 4326), 
            ST_SetSRID(ST_Point(fa.end_longitude, fa.end_latitude), 4326)
          ))
        END::text as geometry,
        0::bigint as project_count,
        true::boolean as is_synthetic,
        true::boolean as is_proposed
      FROM file_assets fa
      JOIN project_files pf ON fa.file_id = pf.id
      WHERE pf.status != 'APPROVED'
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.createAsset = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      asset_id, type_of_road, length, row_width, 
      start_point, start_latitude, start_longitude,
      end_point, end_latitude, end_longitude,
      history_of_road, road_taken_over_from, year_of_taken_over,
      width_of_carriage_way, width_of_central_verge, width_of_footpath,
      lhs_green_belt, rhs_green_belt, street_lights,
      paved_portion_lhs, paved_portion_rhs,
      cross_section_of_road, storm_water_drain_lhs, storm_water_drain_rhs,
      vertices
    } = req.body;

    await client.query('BEGIN');

    const toNull = (val) => (val === "" ? null : val);

    // 1. Insert into Master Assets Table
    let geometry = null;
    if (start_latitude && start_longitude && end_latitude && end_longitude) {
      const sLat = parseFloat(start_latitude);
      const sLon = parseFloat(start_longitude);
      const eLat = parseFloat(end_latitude);
      const eLon = parseFloat(end_longitude);
      
      if (!isNaN(sLat) && !isNaN(sLon) && !isNaN(eLat) && !isNaN(eLon)) {
        geometry = `ST_SetSRID(ST_MakeLine(ST_MakePoint(${sLon}, ${sLat}), ST_MakePoint(${eLon}, ${eLat})), 4326)`;
      }
    }

    const assetQuery = `
      INSERT INTO assets (
        asset_code, type, length, width, zone, ward, geometry
      ) VALUES (
        $1, $2, $3, $4, 'N/A', 'N/A', ${geometry ? geometry : 'NULL'}
      ) RETURNING id
    `;

    const assetRes = await client.query(assetQuery, [
      asset_id, 
      type_of_road || 'Road', 
      toNull(length) || 0, 
      toNull(row_width) || 0
    ]);
    
    const newAssetId = assetRes.rows[0].id;

    // 2. Insert into project_assets for detailed metadata
    const paQuery = `
      INSERT INTO project_assets (
        project_id, asset_id, road_taken_over_from, year_of_taken_over, history_of_road,
        start_point, start_latitude, start_longitude,
        end_point, end_latitude, end_longitude,
        length, width_of_carriage_way, width_of_central_verge, width_of_footpath,
        lhs_green_belt, rhs_green_belt, street_lights, row_width,
        type_of_road, paved_portion_lhs, paved_portion_rhs,
        cross_section_of_road, storm_water_drain_lhs, storm_water_drain_rhs,
        vertices
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    `;

    const paValues = [
      null, // project_id is null for stand-alone assets
      newAssetId.toString(),
      road_taken_over_from,
      toNull(year_of_taken_over),
      history_of_road,
      start_point,
      toNull(start_latitude),
      toNull(start_longitude),
      end_point,
      toNull(end_latitude),
      toNull(end_longitude),
      length,
      width_of_carriage_way,
      width_of_central_verge,
      width_of_footpath,
      lhs_green_belt,
      rhs_green_belt,
      street_lights,
      row_width,
      type_of_road,
      paved_portion_lhs,
      paved_portion_rhs,
      cross_section_of_road,
      storm_water_drain_lhs,
      storm_water_drain_rhs,
      JSON.stringify(vertices || [])
    ];

    await client.query(paQuery, paValues);

    await client.query('COMMIT');
    res.status(201).json({ id: newAssetId, asset_code: asset_id });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("CREATE ASSET ERROR:", err);

    // Debug Logging to file
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../../backend_error.log');
    const logMsg = `\n[${new Date().toISOString()}] CREATE ASSET ERROR:\n${err.message}\n${err.stack}\nREQ BODY: ${JSON.stringify(req.body)}\n`;
    fs.appendFileSync(logPath, logMsg);

    res.status(500).send("Server Error: " + err.message);
  } finally {
    client.release();
  }
};
