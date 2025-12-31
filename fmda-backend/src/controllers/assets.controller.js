const pool = require("../config/db");

// GET all assets (for map + dashboard)
exports.getAllAssets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, asset_code, asset_type,
             ST_AsGeoJSON(geom) AS geometry,
             length, width, zone, ward
      FROM assets
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single asset by id
exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM assets WHERE id = $1",
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
